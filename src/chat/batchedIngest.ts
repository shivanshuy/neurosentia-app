/**
 * Client-side text chunking + configurable multi-request ingest.
 * Example: 100 chunks with chunks_per_request=20 → 5 HTTP calls (not 100).
 */

import { getServeConfig } from '../config/serve';

const CHUNK_SIZE = 1_000;
const CHUNK_OVERLAP = 200;
const PREVIEW_CHARS = 8_000;

/** Chunks per HTTP request — from config.json ingestChunksPerRequest. */
export function chunksPerRequest(): number {
  return getServeConfig().ingestChunksPerRequest;
}

export type IngestChunk = {
  chunk_index: number;
  text: string;
};

export type IngestChunkResult = {
  chunk_index: number;
  char_count: number;
};

export type IngestChunksResponse = {
  ok: boolean;
  part_index: number;
  chunks_indexed: number;
  total_chunks_indexed: number;
  chunks: IngestChunkResult[];
  summary?: string;
  chunk_count?: number;
  title?: string;
};

export type IngestChunksBase = {
  thread_id: string;
  source_id: string;
  source_name: string;
  source_kind: string;
  source_url?: string;
};

export type IngestProgress = {
  partIndex: number;
  totalParts: number;
  totalChunksIndexed: number;
};

export function splitTextIntoChunks(
  text: string,
  chunkSize = CHUNK_SIZE,
  overlap = CHUNK_OVERLAP,
): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);

    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const lastBreak = Math.max(slice.lastIndexOf('\n\n'), slice.lastIndexOf('\n'), slice.lastIndexOf('. '));
      if (lastBreak > chunkSize * 0.4) {
        end = start + lastBreak + (slice[lastBreak] === '.' ? 2 : 1);
      }
    }

    const piece = normalized.slice(start, end).trim();
    if (piece) chunks.push(piece);

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export function buildIngestChunks(text: string): IngestChunk[] {
  return splitTextIntoChunks(text).map((chunk, chunk_index) => ({ chunk_index, text: chunk }));
}

/** Group chunks into HTTP request batches (e.g. 20 chunks per call). */
export function groupChunksForRequests(
  chunks: IngestChunk[],
  perRequest = chunksPerRequest(),
): IngestChunk[][] {
  if (chunks.length === 0) return [[]];

  const groups: IngestChunk[][] = [];
  for (let i = 0; i < chunks.length; i += perRequest) {
    groups.push(chunks.slice(i, i + perRequest));
  }
  return groups;
}

async function postIngestChunks(
  ingestUrl: string,
  body: IngestChunksBase & {
    chunks: IngestChunk[];
    preview_text?: string;
    part_index: number;
    total_parts: number;
    is_last: boolean;
  },
  signal?: AbortSignal,
): Promise<IngestChunksResponse> {
  const response = await fetch(`${ingestUrl}/chunks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = await response.text();
    try {
      const parsed = JSON.parse(detail) as { detail?: string };
      if (parsed.detail) detail = parsed.detail;
    } catch {
      /* use raw body */
    }
    throw new Error(detail || `Ingest failed (${response.status})`);
  }

  return response.json() as Promise<IngestChunksResponse>;
}

/**
 * Send chunks in configurable batches.
 * 100 chunks @ 20/request → 5 calls. Summary returned on the last call only.
 */
export async function sendIngestChunks(
  ingestUrl: string,
  base: IngestChunksBase,
  text: string,
  options: { signal?: AbortSignal; onProgress?: (progress: IngestProgress) => void } = {},
): Promise<IngestChunksResponse> {
  const chunks = buildIngestChunks(text);
  const previewText = text.trim().slice(0, PREVIEW_CHARS);
  const parts = groupChunksForRequests(chunks);
  const totalParts = parts.length;

  let lastResponse: IngestChunksResponse | null = null;

  for (let partIndex = 0; partIndex < totalParts; partIndex += 1) {
    const isLast = partIndex === totalParts - 1;
    lastResponse = await postIngestChunks(
      ingestUrl,
      {
        ...base,
        chunks: parts[partIndex],
        preview_text: isLast ? previewText : undefined,
        part_index: partIndex,
        total_parts: totalParts,
        is_last: isLast,
      },
      options.signal,
    );

    options.onProgress?.({
      partIndex,
      totalParts,
      totalChunksIndexed: lastResponse.total_chunks_indexed,
    });
  }

  if (totalParts === 0) {
    lastResponse = await postIngestChunks(
      ingestUrl,
      {
        ...base,
        chunks: [],
        preview_text: previewText,
        part_index: 0,
        total_parts: 1,
        is_last: true,
      },
      options.signal,
    );
  }

  if (!lastResponse?.summary) {
    throw new Error('Server returned an empty ingest summary.');
  }

  return lastResponse;
}

export async function deleteIngestSource(
  ingestUrl: string,
  threadId: string,
  sourceId: string,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(
    `${ingestUrl}/sources/${encodeURIComponent(threadId)}/${encodeURIComponent(sourceId)}`,
    { method: 'DELETE', signal },
  );

  if (!response.ok) {
    let detail = await response.text();
    try {
      const parsed = JSON.parse(detail) as { detail?: string };
      if (parsed.detail) detail = parsed.detail;
    } catch {
      /* use raw body */
    }
    throw new Error(detail || `Delete failed (${response.status})`);
  }
}
