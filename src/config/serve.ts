/**
 * Runtime serve connection settings loaded from /config.json (public/).
 * Edit config.json and reload the app — no rebuild required.
 */

export type ServeConfig = {
  langGraphUrl: string;
  ingestUrl: string;
  ingestChunksPerRequest: number;
};

const DEFAULT_CONFIG: ServeConfig = {
  langGraphUrl: '/api/langgraph',
  ingestUrl: '/api/ingest',
  ingestChunksPerRequest: 20,
};

let loaded: ServeConfig | null = null;

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

function parsePositiveInt(raw: unknown, fallback: number): number {
  const parsed = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function normalizeConfig(raw: unknown): ServeConfig {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  return {
    langGraphUrl: trimTrailingSlashes(
      typeof record.langGraphUrl === 'string' && record.langGraphUrl.trim()
        ? record.langGraphUrl.trim()
        : DEFAULT_CONFIG.langGraphUrl,
    ),
    ingestUrl: trimTrailingSlashes(
      typeof record.ingestUrl === 'string' && record.ingestUrl.trim()
        ? record.ingestUrl.trim()
        : DEFAULT_CONFIG.ingestUrl,
    ),
    ingestChunksPerRequest: parsePositiveInt(
      record.ingestChunksPerRequest,
      DEFAULT_CONFIG.ingestChunksPerRequest,
    ),
  };
}

function configUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}config.json`;
}

/** Fetch and cache config.json. Call once before rendering the app. */
export async function loadServeConfig(): Promise<ServeConfig> {
  const response = await fetch(configUrl(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${configUrl()} (${response.status})`);
  }

  const parsed: unknown = await response.json();
  loaded = normalizeConfig(parsed);
  return loaded;
}

/** Cached config after loadServeConfig() — throws if not loaded yet. */
export function getServeConfig(): ServeConfig {
  if (!loaded) {
    throw new Error('Serve config not loaded — call loadServeConfig() at startup');
  }
  return loaded;
}
