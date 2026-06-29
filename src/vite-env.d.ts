/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEUROSENTIA_SERVE_URL?: string;
  readonly VITE_NEUROSENTIA_INGEST_URL?: string;
  readonly VITE_INGEST_CHUNKS_PER_REQUEST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
