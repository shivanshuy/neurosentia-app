import type { ChatMessage, ChatPersonaMode } from './types';

export type MapNodeKind =
  | 'session'
  | 'location'
  | 'mode'
  | 'query'
  | 'reply'
  | 'source'
  | 'attachment'
  | 'service';

export type MapNode = {
  id: string;
  kind: MapNodeKind;
  label: string;
  detail?: string;
  href?: string;
};

export type MapEdge = {
  from: string;
  to: string;
  label?: string;
};

export type ThreadMap = {
  nodes: MapNode[];
  edges: MapEdge[];
};

export const NEUROSENTIA_SERVICE_AREAS: MapNode[] = [
  { id: 'svc-rag', kind: 'service', label: 'RAG & KNOWLEDGE', detail: 'Indexed corpora, retrieval pipelines' },
  { id: 'svc-chat', kind: 'service', label: 'CONVERSATIONAL AI', detail: 'Agents, tools, LangGraph' },
  { id: 'svc-scope', kind: 'service', label: 'POC & SCOPING', detail: '4-week delivery playbooks' },
  { id: 'svc-ops', kind: 'service', label: 'LLM OPS', detail: 'Eval, guardrails, observability' },
];

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;
const ATTACHED_RE = /\[ATTACHED:\s*([^\]]+)\]/i;

function stripAttachmentBody(text: string) {
  return text.split('\n[ATTACHMENT CONTENT]')[0]?.trim() ?? text;
}

function summarize(text: string, max = 44) {
  const clean = stripAttachmentBody(text).replace(/\s+/g, ' ').trim();
  if (!clean) return 'EMPTY TRANSMISSION';
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function extractUrls(text: string) {
  const matches = text.match(URL_RE) ?? [];
  return [...new Set(matches.map((url) => url.replace(/[.,;:!?)]+$/, '')))];
}

function extractAttachmentNames(text: string) {
  const match = text.match(ATTACHED_RE);
  if (!match) return [];
  return match[1].split(',').map((name) => name.trim()).filter(Boolean);
}

function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function buildThreadMap(input: {
  messages: ChatMessage[];
  sessionId: string | null;
  userLocation: string;
  personaMode: ChatPersonaMode;
}): ThreadMap {
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];

  const sessionId = 'node-session';
  nodes.push({
    id: sessionId,
    kind: 'session',
    label: 'ACTIVE THREAD',
    detail: input.sessionId ? input.sessionId.slice(0, 12).toUpperCase() : 'UNSAVED',
  });

  const modeId = 'node-mode';
  nodes.push({
    id: modeId,
    kind: 'mode',
    label: input.personaMode === 'architect' ? 'ARCHITECT MODE' : 'BRIEF MODE',
  });
  edges.push({ from: sessionId, to: modeId, label: 'persona' });

  if (input.userLocation.trim()) {
    const locId = 'node-location';
    nodes.push({
      id: locId,
      kind: 'location',
      label: input.userLocation.trim().toUpperCase(),
      detail: 'Client context',
    });
    edges.push({ from: sessionId, to: locId, label: 'loc' });
  }

  let exchange = 0;
  for (let i = 0; i < input.messages.length; i += 1) {
    const message = input.messages[i];
    if (message.role !== 'user') continue;

    exchange += 1;
    const queryId = `node-query-${message.id}`;
    nodes.push({
      id: queryId,
      kind: 'query',
      label: `Q${exchange}`,
      detail: summarize(message.content),
    });
    edges.push({ from: sessionId, to: queryId, label: 'asked' });

    for (const [index, name] of extractAttachmentNames(message.content).entries()) {
      const attachId = `node-attach-${message.id}-${index}`;
      nodes.push({
        id: attachId,
        kind: 'attachment',
        label: name.toUpperCase(),
      });
      edges.push({ from: queryId, to: attachId, label: 'file' });
    }

    const assistant = input.messages[i + 1];
    if (!assistant || assistant.role !== 'assistant') continue;

    const replyId = `node-reply-${assistant.id}`;
    nodes.push({
      id: replyId,
      kind: 'reply',
      label: `R${exchange}`,
      detail: summarize(assistant.content),
    });
    edges.push({ from: queryId, to: replyId, label: 'answered' });

    const sourceUrls = new Map<string, string>();
    for (const source of assistant.sources ?? []) {
      sourceUrls.set(source.url, source.title);
    }
    for (const url of extractUrls(assistant.content)) {
      if (!sourceUrls.has(url)) sourceUrls.set(url, hostLabel(url));
    }

    let sourceIndex = 0;
    for (const [url, title] of sourceUrls) {
      sourceIndex += 1;
      const sourceId = `node-source-${assistant.id}-${sourceIndex}`;
      nodes.push({
        id: sourceId,
        kind: 'source',
        label: title.length > 36 ? `${title.slice(0, 36)}…` : title,
        detail: hostLabel(url),
        href: url,
      });
      edges.push({ from: replyId, to: sourceId, label: 'ref' });
    }
  }

  const hubId = 'node-neurosentia';
  nodes.push({
    id: hubId,
    kind: 'session',
    label: 'NEUROSENTIA',
    detail: 'Service coverage',
  });

  for (const service of NEUROSENTIA_SERVICE_AREAS) {
    nodes.push(service);
    edges.push({ from: hubId, to: service.id, label: 'offers' });
  }

  return { nodes, edges };
}

export function getMapChildren(map: ThreadMap, parentId: string) {
  return map.edges
    .filter((edge) => edge.from === parentId)
    .map((edge) => {
      const node = map.nodes.find((entry) => entry.id === edge.to);
      return node ? { node, edge } : null;
    })
    .filter((entry): entry is { node: MapNode; edge: MapEdge } => entry !== null);
}
