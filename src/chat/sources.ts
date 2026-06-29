import type { SearchSource } from './types';

const LINK_LINE = /^\s*Link:\s*(https?:\/\/\S+)/im;

function parseBlock(block: string): SearchSource | null {
  const linkMatch = block.match(LINK_LINE);
  if (!linkMatch) return null;

  const titleMatch = block.match(/^\d+\.\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() || linkMatch[1];

  return { title, url: linkMatch[1].trim() };
}

export function parseSourcesFromToolOutput(toolText: string): SearchSource[] {
  const blocks = toolText.split(/\n\n+/);
  const seen = new Set<string>();
  const sources: SearchSource[] = [];

  for (const block of blocks) {
    const parsed = parseBlock(block);
    if (!parsed || seen.has(parsed.url)) continue;
    seen.add(parsed.url);
    sources.push(parsed);
  }

  return sources;
}

type RawThreadMessage = {
  type?: string;
  role?: string;
  content?: unknown;
  name?: string;
};

export function parseSourcesFromThreadState(state: unknown): SearchSource[] {
  if (!state || typeof state !== 'object') return [];

  const values = (state as { values?: { messages?: RawThreadMessage[] } }).values;
  const rawMessages = values?.messages
    ?? (state as { messages?: RawThreadMessage[] }).messages;

  if (!Array.isArray(rawMessages)) return [];

  const sources: SearchSource[] = [];
  const seen = new Set<string>();

  for (let i = rawMessages.length - 1; i >= 0; i -= 1) {
    const msg = rawMessages[i];
    const kind = (msg.type ?? msg.role ?? '').toLowerCase();
    if (kind !== 'tool' && kind !== 'toolmessage') continue;
    if (msg.name && msg.name !== 'duckduckgo_search') continue;

    const text = typeof msg.content === 'string' ? msg.content : '';
    for (const source of parseSourcesFromToolOutput(text)) {
      if (seen.has(source.url)) continue;
      seen.add(source.url);
      sources.push(source);
    }
    if (sources.length > 0) break;
  }

  return sources;
}
