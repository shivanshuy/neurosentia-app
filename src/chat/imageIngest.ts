export type ImageIngestMode = 'ocr' | 'vision' | 'both';

export const IMAGE_INGEST_MODES: ImageIngestMode[] = ['ocr', 'vision', 'both'];

export type IngestImageResponse = {
  ok: boolean;
  mode: ImageIngestMode;
  ocr_chars: number;
  vision_chars: number;
  chunks_indexed: number;
  total_chunks_indexed: number;
  summary: string;
  chunk_count: number;
  title: string;
  extracted_text: string;
};

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'tif', 'tiff', 'bmp']);

export function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  const parts = file.name.split('.');
  const ext = parts.length > 1 ? (parts.pop()?.toLowerCase() ?? '') : '';
  return IMAGE_EXTENSIONS.has(ext);
}

export async function sendIngestImage(
  ingestUrl: string,
  params: {
    thread_id: string;
    source_id: string;
    source_name: string;
    mode: ImageIngestMode;
    file: File;
  },
  signal?: AbortSignal,
): Promise<IngestImageResponse> {
  const form = new FormData();
  form.append('thread_id', params.thread_id);
  form.append('source_id', params.source_id);
  form.append('source_name', params.source_name);
  form.append('mode', params.mode);
  form.append('file', params.file, params.file.name);

  const response = await fetch(`${ingestUrl}/image`, {
    method: 'POST',
    signal,
    body: form,
  });

  if (!response.ok) {
    let detail = await response.text();
    try {
      const parsed = JSON.parse(detail) as { detail?: string };
      if (parsed.detail) detail = parsed.detail;
    } catch {
      /* use raw body */
    }
    throw new Error(detail || `Image ingest failed (${response.status})`);
  }

  return response.json() as Promise<IngestImageResponse>;
}
