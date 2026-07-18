import { getServeConfig } from '../config/serve';

export type DatasetBuildFormat = 'alpaca' | 'sharegpt' | 'embedding';

export type DatasetBuildRow = Record<string, unknown>;

export type DatasetBuildJob = {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  format: DatasetBuildFormat;
  messages: string[];
  rows: DatasetBuildRow[];
  total_chunks: number;
  processed_chunks: number;
  error: string | null;
};

export type StartBuildRequest = {
  text: string;
  format: DatasetBuildFormat;
  max_pairs?: number;
  source_name?: string;
};

export class DatasetBuildJobNotFoundError extends Error {
  constructor(message = 'Build job not found') {
    super(message);
    this.name = 'DatasetBuildJobNotFoundError';
  }
}

function ingestBase(): string {
  return getServeConfig().ingestUrl;
}

export async function startDatasetBuild(req: StartBuildRequest): Promise<{ job_id: string }> {
  const response = await fetch(`${ingestBase()}/fine-tune/datasets/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Build start failed (${response.status})`);
  }
  return response.json() as Promise<{ job_id: string }>;
}

export async function startDatasetBuildFromFile(
  file: File,
  format: DatasetBuildFormat,
  maxPairs?: number,
): Promise<{ job_id: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('format', format);
  if (maxPairs != null) {
    form.append('max_pairs', String(maxPairs));
  }
  const response = await fetch(`${ingestBase()}/fine-tune/datasets/build/upload`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Upload build failed (${response.status})`);
  }
  return response.json() as Promise<{ job_id: string }>;
}

export async function getDatasetBuildJob(jobId: string): Promise<DatasetBuildJob> {
  const response = await fetch(`${ingestBase()}/fine-tune/datasets/build/${encodeURIComponent(jobId)}`, {
    cache: 'no-store',
  });
  if (response.status === 404) {
    throw new DatasetBuildJobNotFoundError(
      'Build job not found — the ingest server may have restarted. Run the build again.',
    );
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Job poll failed (${response.status})`);
  }
  return response.json() as Promise<DatasetBuildJob>;
}

export async function fetchServerDatasetCatalog(): Promise<unknown> {
  const response = await fetch(`${ingestBase()}/fine-tune/datasets`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Catalog fetch failed (${response.status})`);
  }
  return response.json();
}
