import { createMessageId } from '../chatHistory';
import type { SessionDocument, SessionSource, SessionUrlBrief } from './types';

const CONTEXT_CHAR_BUDGET = 12_000;

export function createImageSource(
  name: string,
  text: string,
  summary: string,
  id?: string,
): SessionSource {
  return {
    id: id ?? createMessageId(),
    kind: 'image',
    name,
    text,
    summary,
    enabled: true,
    ingestedAt: Date.now(),
  };
}

export function createFileSource(
  name: string,
  text: string,
  summary: string,
  id?: string,
): SessionSource {
  return {
    id: id ?? createMessageId(),
    kind: 'file',
    name,
    text,
    summary,
    enabled: true,
    ingestedAt: Date.now(),
  };
}

export function createUrlSource(
  url: string,
  title: string,
  text: string,
  summary: string,
  id?: string,
): SessionSource {
  return {
    id: id ?? createMessageId(),
    kind: 'url',
    name: title || url,
    url,
    text,
    summary,
    enabled: true,
    ingestedAt: Date.now(),
  };
}

export function legacySourcesFromConversation(
  sessionDocument?: SessionDocument | null,
  sessionUrl?: SessionUrlBrief | null,
): SessionSource[] {
  const sources: SessionSource[] = [];
  if (sessionDocument?.text) {
    sources.push(createFileSource(sessionDocument.name, sessionDocument.text, sessionDocument.summary));
  }
  if (sessionUrl?.summary) {
    sources.push(
      createUrlSource(
        sessionUrl.url,
        sessionUrl.title,
        sessionUrl.summary,
        sessionUrl.summary,
      ),
    );
  }
  return sources;
}

export function enabledSources(sources: SessionSource[]): SessionSource[] {
  return sources.filter((source) => source.enabled);
}

export function hasEnabledSources(sources: SessionSource[]): boolean {
  return enabledSources(sources).length > 0;
}

export function toggleSourceEnabled(sources: SessionSource[], id: string): SessionSource[] {
  return sources.map((source) =>
    source.id === id ? { ...source, enabled: !source.enabled } : source,
  );
}

export function removeSource(sources: SessionSource[], id: string): SessionSource[] {
  return sources.filter((source) => source.id !== id);
}

export function buildSessionBriefingsContext(sources: SessionSource[]): string {
  const active = enabledSources(sources);
  if (active.length === 0) return '';

  return active
    .map((source) => {
      const header =
        source.kind === 'url'
          ? `=== SOURCE: ${source.name} (${source.url}) ===`
          : source.kind === 'image'
            ? `=== SOURCE: ${source.name} (image) ===`
            : `=== SOURCE: ${source.name} ===`;
      return `${header}\nBriefing:\n${source.summary.trim() || '(no briefing)'}`;
    })
    .join('\n\n---\n\n');
}

export function buildSessionDocumentContext(sources: SessionSource[]): string {
  const active = enabledSources(sources);
  if (active.length === 0) return '';

  const perSourceBudget = Math.floor(CONTEXT_CHAR_BUDGET / active.length);
  const blocks: string[] = [];

  for (const source of active) {
    const header =
      source.kind === 'url'
        ? `=== SOURCE: ${source.name} (${source.url}) ===\nBriefing:\n${source.summary}\n\nFull text:\n`
        : source.kind === 'image'
          ? `=== SOURCE: ${source.name} (image) ===\nBriefing:\n${source.summary}\n\nFull text:\n`
          : `=== SOURCE: ${source.name} ===\nBriefing:\n${source.summary}\n\nFull text:\n`;
    const body = source.text.trim() || source.summary;
    blocks.push((header + body).slice(0, perSourceBudget));
  }

  return blocks.join('\n\n---\n\n').slice(0, CONTEXT_CHAR_BUDGET);
}

export function sourceDisplayLabel(source: SessionSource): string {
  const name = source.name?.trim();
  if (name) return name;
  if (source.url?.trim()) return source.url.trim();
  return source.kind === 'url' ? 'Ingested page' : source.kind === 'image' ? 'Ingested image' : 'Ingested document';
}

export function sourceListLabel(sources: SessionSource[]): string {
  const active = enabledSources(sources).length;
  return `${active}/${sources.length} SOURCES ACTIVE`;
}
