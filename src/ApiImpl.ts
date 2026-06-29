import axios from 'axios';

import { parseSourcesFromThreadState } from './chat/sources';
import { parseToolTracesFromThreadState } from './chat/toolTrace';
import type {
  IngestResult,
  SearchSource,
  StreamRunOptions,
  StreamRunResult,
  ThreadDiagramResult,
  ThreadSummarizeResult,
} from './chat/types';
import { deleteIngestSource, sendIngestChunks } from './chat/batchedIngest';
import type { ImageIngestMode } from './chat/imageIngest';
import { sendIngestImage } from './chat/imageIngest';
import { formatPinsForContext } from './chat/memoryPins';
import { buildSessionBriefingsContext, buildSessionDocumentContext, enabledSources } from './chat/sessionSources';
import type { StoredChatMessage } from './chatHistory';
import { createMessageId } from './chatHistory';
import { loadPersonaMode, loadUserLocation } from './chat/preferences';
import { getServeConfig } from './config/serve';
const CHATTERBUG_ASSISTANT_ID = 'chatterbug';
const SUMMARIZE_ASSISTANT_ID = 'summarize';
const DIAGRAM_ASSISTANT_ID = 'diagram';
const INGEST_ASSISTANT_ID = 'ingest';

const CONTEXT_TEXT_LIMIT = 12_000;

export const LONG_THREAD_MESSAGE_COUNT = 12;

type ParsedSSEEvent = {
  event: string;
  data: unknown;
};

type MessageChunk = {
  content?: unknown;
  type?: string;
  id?: string;
  tool_calls?: unknown[];
};

function normalizeSSEBuffer(buffer: string): string {
  return buffer.replace(/\r\n/g, '\n');
}

function consumeSSEBuffer(buffer: string): { events: ParsedSSEEvent[]; rest: string } {
  const events: ParsedSSEEvent[] = [];
  const blocks = buffer.split('\n\n');
  const rest = blocks.pop() ?? '';

  for (const block of blocks) {
    if (!block.trim()) continue;

    let eventType = 'message';
    const dataLines: string[] = [];

    for (const line of block.split('\n')) {
      if (line.startsWith(':')) continue;
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (dataLines.length === 0) continue;

    try {
      events.push({ event: eventType, data: JSON.parse(dataLines.join('\n')) });
    } catch {
      /* ignore malformed SSE payloads */
    }
  }

  return { events, rest };
}

function latestAssistantContent(contents: Map<string, string>, order: string[]): string {
  for (let i = order.length - 1; i >= 0; i -= 1) {
    const text = contents.get(order[i]);
    if (text?.trim()) return text;
  }
  return '';
}

function isMessageStreamEvent(eventType: string): boolean {
  const base = eventType.split('|')[0];
  return (
    base === 'messages'
    || base === 'messages/partial'
    || base === 'messages/complete'
  );
}

function extractMessagePayload(data: unknown): MessageChunk | null {
  if (!data) return null;

  if (Array.isArray(data)) {
    const first = data[0];
    if (first && typeof first === 'object') {
      return first as MessageChunk;
    }
    return null;
  }

  if (typeof data === 'object') {
    const block = data as Record<string, unknown>;
    if (typeof block.text === 'string') {
      return { type: 'AIMessageChunk', content: block.text };
    }
    if (typeof block.content === 'string') {
      return { type: 'AIMessageChunk', content: block.content };
    }
  }

  return null;
}

function isAssistantStreamMessage(chunk: MessageChunk): boolean {
  const type = (chunk.type ?? '').toLowerCase();
  if (type === 'human' || type === 'user' || type === 'tool' || type === 'toolmessage') {
    return false;
  }
  return type === 'ai' || type === 'aimessage' || type === 'aimessagechunk';
}

function applyMessagesEvent(
  data: unknown,
  contents: Map<string, string>,
  order: string[],
): string | null {
  const chunk = extractMessagePayload(data);
  if (!chunk || !isAssistantStreamMessage(chunk)) return null;

  const content = typeof chunk.content === 'string' ? chunk.content : '';
  const messageId = chunk.id ?? `msg-${order.length}`;

  if (!order.includes(messageId)) {
    order.push(messageId);
  }

  const type = (chunk.type ?? '').toLowerCase();

  if (type === 'aimessagechunk') {
    if (!content) return null;
    contents.set(messageId, (contents.get(messageId) ?? '') + content);
    return latestAssistantContent(contents, order);
  }

  if (type === 'ai' || type === 'aimessage') {
    if (chunk.tool_calls?.length && !content.trim()) {
      return null;
    }
    if (content) {
      contents.set(messageId, content);
    }
    return latestAssistantContent(contents, order);
  }

  return null;
}

async function consumeFetchSSE(
  response: Response,
  onEvent: (event: ParsedSSEEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming is not supported for this response.');
  }

  const decoder = new TextDecoder();
  let sseBuffer = '';

  while (true) {
    if (signal?.aborted) {
      await reader.cancel();
      break;
    }

    const { done, value } = await reader.read();
    if (done) break;

    sseBuffer += normalizeSSEBuffer(decoder.decode(value, { stream: true }));
    const parsed = consumeSSEBuffer(sseBuffer);
    sseBuffer = parsed.rest;

    for (const evt of parsed.events) {
      onEvent(evt);
    }
  }

  if (!signal?.aborted && sseBuffer.trim()) {
    const parsed = consumeSSEBuffer(`${sseBuffer}\n\n`);
    for (const evt of parsed.events) {
      onEvent(evt);
    }
  }
}

function processStreamEvent(
  evt: ParsedSSEEvent,
  messageContents: Map<string, string>,
  messageOrder: string[],
  state: { streamedContent: string; sawStreamChunks: boolean; runId: string | null },
  onToken: (content: string) => void,
): void {
  if (evt.event === 'metadata' && evt.data && typeof evt.data === 'object') {
    const runId = (evt.data as { run_id?: string }).run_id;
    if (runId) state.runId = runId;
  }

  if (!isMessageStreamEvent(evt.event)) return;

  const next = applyMessagesEvent(evt.data, messageContents, messageOrder);
  if (next === null || next === state.streamedContent) return;

  const payload = extractMessagePayload(evt.data);
  if (payload && isAssistantStreamMessage(payload)) {
    const type = (payload.type ?? '').toLowerCase();
    if (type === 'aimessagechunk' || (type === 'ai' && payload.content)) {
      state.sawStreamChunks = true;
    }
  }

  state.streamedContent = next;
  onToken(next);
}

async function ensureThread(sessionId: string | null): Promise<string> {
  if (sessionId) return sessionId;

  const { data } = await axios.post<{ thread_id: string }>(
    `${getServeConfig().langGraphUrl}/threads`,
    {},
    { headers: { 'Content-Type': 'application/json' } },
  );

  return data.thread_id;
}

function extractAssistantContent(state: unknown): string {
  if (!state || typeof state !== 'object') return '';

  const messages = (state as { messages?: Array<{ type?: string; content?: unknown }> }).messages;
  if (!Array.isArray(messages)) return '';

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.type === 'ai' || message.type === 'assistant') {
      return typeof message.content === 'string' ? message.content : '';
    }
  }

  return '';
}

type LangGraphMessage = {
  id?: string;
  type?: string;
  role?: string;
  content?: unknown;
  tool_calls?: unknown[];
};

function messageRole(message: LangGraphMessage): 'user' | 'assistant' | null {
  const kind = message.type ?? message.role ?? '';
  if (kind === 'human' || kind === 'user') return 'user';
  if (kind === 'ai' || kind === 'assistant') return 'assistant';
  return null;
}

function messageText(content: unknown): string {
  return typeof content === 'string' ? content : '';
}

function parseThreadMessages(state: unknown): StoredChatMessage[] {
  if (!state || typeof state !== 'object') return [];

  const values = (state as { values?: { messages?: LangGraphMessage[] } }).values;
  const rawMessages = values?.messages
    ?? (state as { messages?: LangGraphMessage[] }).messages;

  if (!Array.isArray(rawMessages)) return [];

  const parsed: StoredChatMessage[] = [];
  const now = Date.now();

  for (const raw of rawMessages) {
    const role = messageRole(raw);
    if (!role) continue;

    const content = messageText(raw.content);
    if (!content.trim()) continue;
    if (role === 'assistant' && raw.tool_calls?.length && !content.trim()) continue;

    parsed.push({
      id: raw.id ?? createMessageId(),
      role,
      content,
      timestamp: now,
    });
  }

  return parsed;
}

async function fetchThreadState(threadId: string): Promise<unknown> {
  const { data } = await axios.get(`${getServeConfig().langGraphUrl}/threads/${threadId}/state`, {
    headers: { Accept: 'application/json' },
  });
  return data;
}

async function fetchThreadMessages(threadId: string): Promise<StoredChatMessage[]> {
  const data = await fetchThreadState(threadId);
  return parseThreadMessages(data);
}

async function fetchSearchSources(threadId: string): Promise<SearchSource[]> {
  const data = await fetchThreadState(threadId);
  return parseSourcesFromThreadState(data);
}

function buildClientLocalTime(): string {
  return new Date().toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function buildRunBody(message: string, options: StreamRunOptions = {}, threadId?: string) {
  const persona = options.persona ?? loadPersonaMode();
  const location = options.location ?? loadUserLocation();

  const context: Record<string, string> = {
    client_local_time: buildClientLocalTime(),
    client_persona: persona,
  };

  if (location) {
    context.client_location = location;
  }

  if (options.memoryPins?.length && !options.sourcesOnlyMode) {
    context.memory_pins = formatPinsForContext(options.memoryPins);
  }

  if (options.rollingSummary?.trim() && !options.sourcesOnlyMode) {
    context.rolling_summary = options.rollingSummary.trim().slice(0, CONTEXT_TEXT_LIMIT);
  }

  if (threadId && options.sessionSources?.length) {
    const active = enabledSources(options.sessionSources);
    if (active.length) {
      context.thread_id = threadId;
      context.session_source_ids = active.map((source) => source.id).join(',');
      context.user_query = message.trim();
      const docContext = options.sourcesOnlyMode
        ? buildSessionDocumentContext(active)
        : buildSessionBriefingsContext(active);
      if (docContext) {
        context.session_document = docContext;
      }
    }
  }

  if (options.sourcesOnlyMode) {
    context.sources_only = 'true';
  }

  return {
    assistant_id: CHATTERBUG_ASSISTANT_ID,
    input: {
      messages: [{ role: 'user', content: message }],
    },
    context,
  };
}

function assistantContentAfterLatestUser(messages: StoredChatMessage[]): string {
  let lastUserIdx = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') {
      lastUserIdx = i;
      break;
    }
  }
  if (lastUserIdx === -1) return '';

  for (let i = messages.length - 1; i > lastUserIdx; i -= 1) {
    const message = messages[i];
    if (message.role === 'assistant' && message.content.trim()) {
      return message.content;
    }
  }

  return '';
}

async function cancelRun(threadId: string, runId: string) {
  try {
    await axios.post(
      `${getServeConfig().langGraphUrl}/threads/${threadId}/runs/${runId}/cancel`,
      { wait: false, action: 'interrupt' },
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    /* best-effort */
  }
}

const streamAIMessage = async (
  message: string,
  sessionId: string | null,
  onToken: (content: string) => void,
  options: StreamRunOptions = {},
): Promise<StreamRunResult> => {
  const threadId = await ensureThread(sessionId);
  const messageContents = new Map<string, string>();
  const messageOrder: string[] = [];
  const state = { streamedContent: '', sawStreamChunks: false, runId: null as string | null };
  const signal = options.signal;

  let response: Response;
  try {
    response = await fetch(`${getServeConfig().langGraphUrl}/threads/${threadId}/runs/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        ...buildRunBody(message, options, threadId),
        stream_mode: ['messages'],
      }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      return { sessionId: threadId, content: state.streamedContent, sources: [], cancelled: true };
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Stream request failed (${response.status})`);
  }

  try {
    await consumeFetchSSE(
      response,
      (evt) => {
        processStreamEvent(evt, messageContents, messageOrder, state, onToken);
      },
      signal,
    );
  } catch (error) {
    if (!signal?.aborted) throw error;
  }

  const cancelled = Boolean(signal?.aborted);
  if (cancelled && state.runId) {
    await cancelRun(threadId, state.runId);
  }

  if (!state.streamedContent && !cancelled) {
    const threadMessages = await fetchThreadMessages(threadId);
    const assistantContent = assistantContentAfterLatestUser(threadMessages);
    if (assistantContent) {
      state.streamedContent = assistantContent;
      onToken(state.streamedContent);
    }
  }

  const sources = cancelled ? [] : await fetchSearchSources(threadId);

  return {
    sessionId: threadId,
    content: state.streamedContent,
    sources,
    cancelled,
  };
};

function extractSummary(state: unknown): string {
  if (!state || typeof state !== 'object') return '';

  const values = (state as { values?: { summary?: string } }).values;
  if (typeof values?.summary === 'string') return values.summary;

  const direct = (state as { summary?: string }).summary;
  if (typeof direct === 'string') return direct;

  return '';
}

function countThreadMessages(state: unknown): number {
  if (!state || typeof state !== 'object') return 0;

  const values = (state as { values?: { messages?: LangGraphMessage[] } }).values;
  const rawMessages = values?.messages
    ?? (state as { messages?: LangGraphMessage[] }).messages;

  if (!Array.isArray(rawMessages)) return 0;

  return rawMessages.filter((message) => {
    const role = messageRole(message);
    if (!role) return false;
    return Boolean(messageText(message.content).trim());
  }).length;
}

function extractMermaid(state: unknown): string {
  if (!state || typeof state !== 'object') return '';

  const values = (state as { values?: { mermaid?: string } }).values;
  if (typeof values?.mermaid === 'string') return values.mermaid;

  const direct = (state as { mermaid?: string }).mermaid;
  if (typeof direct === 'string') return direct;

  return '';
}

async function runThreadAssistant(
  sessionId: string,
  assistantId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const { data } = await axios.post(
    `${getServeConfig().langGraphUrl}/threads/${sessionId}/runs/wait`,
    {
      assistant_id: assistantId,
      input: {},
    },
    {
      headers: { 'Content-Type': 'application/json' },
      signal,
    },
  );
  return data;
}

async function summarizeThread(
  sessionId: string,
  signal?: AbortSignal,
): Promise<ThreadSummarizeResult> {
  const data = await runThreadAssistant(sessionId, SUMMARIZE_ASSISTANT_ID, signal);

  const summary = extractSummary(data).trim();
  if (!summary) {
    throw new Error('Server returned an empty summary.');
  }

  return {
    summary,
    mermaid: extractMermaid(data).trim(),
    messageCount: countThreadMessages(data),
  };
}

async function diagramThread(
  sessionId: string,
  signal?: AbortSignal,
): Promise<ThreadDiagramResult> {
  const data = await runThreadAssistant(sessionId, DIAGRAM_ASSISTANT_ID, signal);

  const mermaid = extractMermaid(data).trim();
  if (!mermaid) {
    throw new Error('Server returned an empty diagram.');
  }

  return {
    mermaid,
    messageCount: countThreadMessages(data),
  };
}

async function fetchToolTraces(threadId: string, latencyMs = 0) {
  const data = await fetchThreadState(threadId);
  return parseToolTracesFromThreadState(data, latencyMs);
}

function extractIngestResult(state: unknown): IngestResult {
  if (!state || typeof state !== 'object') {
    return { title: '', summary: '', extractedText: '', chunkCount: 0 };
  }

  const values = (state as {
    values?: {
      title?: string;
      summary?: string;
      extracted_text?: string;
      chunk_count?: number;
    };
  }).values;

  const title = values?.title ?? (state as { title?: string }).title ?? '';
  const summary = values?.summary ?? (state as { summary?: string }).summary ?? '';
  const extractedText =
    values?.extracted_text ?? (state as { extracted_text?: string }).extracted_text ?? '';
  const chunkCount =
    values?.chunk_count ?? (state as { chunk_count?: number }).chunk_count ?? 0;

  return {
    title: String(title).trim(),
    summary: String(summary).trim(),
    extractedText: String(extractedText).trim(),
    chunkCount: Number(chunkCount) || 0,
  };
}

async function ingestUrl(
  sessionId: string | null,
  url: string,
  sourceId: string,
  signal?: AbortSignal,
) {
  const threadId = await ensureThread(sessionId);
  const { data } = await axios.post(
    `${getServeConfig().langGraphUrl}/threads/${threadId}/runs/wait`,
    {
      assistant_id: INGEST_ASSISTANT_ID,
      input: {
        source_url: url.trim(),
        source_id: sourceId,
        thread_id: threadId,
        source_kind: 'url',
      },
    },
    { headers: { 'Content-Type': 'application/json' }, signal },
  );

  const result = extractIngestResult(data);
  if (!result.summary) throw new Error('Server returned an empty ingest summary.');
  return { sessionId: threadId, ...result };
}

async function ingestDocument(
  sessionId: string | null,
  name: string,
  text: string,
  sourceId: string,
  options: { signal?: AbortSignal } = {},
) {
  const threadId = await ensureThread(sessionId);
  const result = await sendIngestChunks(
    getServeConfig().ingestUrl,
    {
      thread_id: threadId,
      source_id: sourceId,
      source_name: name,
      source_kind: 'file',
    },
    text,
    { signal: options.signal },
  );

  return {
    sessionId: threadId,
    title: result.title ?? name,
    summary: result.summary ?? '',
    extractedText: text.trim().slice(0, 8_000),
    chunkCount: result.chunk_count ?? result.total_chunks_indexed ?? 0,
  };
}

async function ingestImage(
  sessionId: string | null,
  name: string,
  file: File,
  mode: ImageIngestMode,
  sourceId: string,
  options: { signal?: AbortSignal } = {},
) {
  const threadId = await ensureThread(sessionId);
  const result = await sendIngestImage(
    getServeConfig().ingestUrl,
    {
      thread_id: threadId,
      source_id: sourceId,
      source_name: name,
      mode,
      file,
    },
    options.signal,
  );

  return {
    sessionId: threadId,
    title: result.title ?? name,
    summary: result.summary ?? '',
    extractedText: result.extracted_text ?? '',
    chunkCount: result.chunk_count ?? result.total_chunks_indexed ?? 0,
    imageMode: result.mode,
  };
}

async function deleteDocumentSource(
  sessionId: string | null,
  sourceId: string,
  signal?: AbortSignal,
) {
  if (!sessionId?.trim()) return;
  await deleteIngestSource(getServeConfig().ingestUrl, sessionId.trim(), sourceId.trim(), signal);
}

const getAIMessage = async (message: string, sessionId: string | null) => {
  const threadId = await ensureThread(sessionId);

  const { data } = await axios.post(
    `${getServeConfig().langGraphUrl}/threads/${threadId}/runs/wait`,
    buildRunBody(message, {}, threadId),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const assistantContent = extractAssistantContent(data);

  return {
    data: {
      sessionId: threadId,
      message: { content: assistantContent },
    },
  };
};

export {
  deleteDocumentSource,
  diagramThread,
  fetchSearchSources,
  fetchThreadMessages,
  fetchToolTraces,
  getAIMessage,
  ingestDocument,
  ingestImage,
  ingestUrl,
  streamAIMessage,
  summarizeThread,
};
