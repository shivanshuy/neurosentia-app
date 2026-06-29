import * as React from 'react';
import Box from '@mui/material/Box';
import type { ImageIngestMode } from '../chat/imageIngest';
import { IMAGE_INGEST_MODES } from '../chat/imageIngest';
import type { SessionSource } from '../chat/types';
import { sourceDisplayLabel } from '../chat/sessionSources';

function sourceKindLabel(kind: SessionSource['kind']): string {
  if (kind === 'url') return 'URL';
  if (kind === 'image') return 'IMAGE';
  return 'FILE';
}

type DocumentSessionPanelProps = {
  sources: SessionSource[];
  isIngesting: boolean;
  deletingSourceId: string | null;
  ingestError: string | null;
  onPickFiles: (files: File[]) => void;
  onPickImages: (files: File[], mode: ImageIngestMode) => void;
  onIngestUrl: (url: string) => void;
  onDeleteSource: (id: string) => void;
};

export default function DocumentSessionPanel({
  sources,
  isIngesting,
  deletingSourceId,
  ingestError,
  onPickFiles,
  onPickImages,
  onIngestUrl,
  onDeleteSource,
}: DocumentSessionPanelProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const imageRef = React.useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = React.useState('');
  const [imageMode, setImageMode] = React.useState<ImageIngestMode>('both');

  return (
    <Box className="crt-panel crt-doc-panel">
      <Box className="crt-doc-header">
        <span className="crt-doc-title">DOCUMENT LIBRARY</span>
        <span className="crt-doc-stats">{sources.length} INGESTED</span>
      </Box>

      <p className="crt-doc-hint">
        Upload documents, images, or URLs for this transmission. Images are processed on the server
        (Tesseract OCR and/or vision model). Enable CHAT WITH DOCS in the CHAT tab to query them.
      </p>

      <Box className="crt-doc-actions">
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept=".pdf,.txt,.md,.csv,.json,.html,.htm"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) onPickFiles(files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          className="crt-recording-action-btn crt-doc-ingest-btn crt-doc-ingest-btn--full"
          disabled={isIngesting}
          onClick={() => fileRef.current?.click()}
        >
          INGEST FILE(S)
        </button>
      </Box>

      <Box className="crt-doc-image-header">
        <span className="crt-doc-title">IMAGE INGEST</span>
        <Box className="crt-doc-image-modes" role="radiogroup" aria-label="Image ingest mode">
          {IMAGE_INGEST_MODES.map((mode) => (
            <label key={mode} className="crt-doc-image-mode">
              <input
                type="radio"
                name="image-ingest-mode"
                value={mode}
                checked={imageMode === mode}
                disabled={isIngesting}
                onChange={() => setImageMode(mode)}
              />
              {mode.toUpperCase()}
            </label>
          ))}
        </Box>
        <input
          ref={imageRef}
          type="file"
          hidden
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,image/tiff,image/bmp,.png,.jpg,.jpeg,.webp,.gif,.tif,.tiff,.bmp"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) onPickImages(files, imageMode);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          className="crt-recording-action-btn crt-doc-ingest-btn crt-doc-image-ingest-btn"
          disabled={isIngesting}
          onClick={() => imageRef.current?.click()}
        >
          INGEST IMAGE(S)
        </button>
      </Box>

      <Box className="crt-doc-url-row">
        <input
          className="crt-doc-url-input"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="https://..."
        />
        <button
          type="button"
          className="crt-recording-action-btn crt-doc-ingest-btn"
          disabled={isIngesting || !urlDraft.trim()}
          onClick={() => {
            onIngestUrl(urlDraft.trim());
            setUrlDraft('');
          }}
        >
          INGEST URL
        </button>
      </Box>

      {isIngesting && (
        <Box className="crt-doc-loading">
          <span className="crt-typing" aria-label="Ingesting">
            <span>█</span><span>█</span><span>█</span>
          </span>
          PROCESSING &amp; INDEXING…
        </Box>
      )}

      {ingestError && <Box className="crt-doc-error">{ingestError}</Box>}

      {sources.length > 0 && (
        <Box className="crt-doc-source-list-wrap">
          <span className="crt-doc-brief-label">▸ INGESTED DOCUMENTS</span>
          <ul className="crt-doc-source-list">
            {sources.map((source) => (
              <li key={source.id} className="crt-doc-source-item">
                <Box className="crt-doc-source-row">
                  <span className="crt-source-name crt-source-name--library">
                    {sourceDisplayLabel(source)}
                  </span>
                  <span className="crt-source-kind">{sourceKindLabel(source.kind)}</span>
                  <button
                    type="button"
                    className="crt-doc-delete-btn"
                    disabled={isIngesting || deletingSourceId !== null}
                    aria-label={`Delete ${sourceDisplayLabel(source)} and remove embeddings`}
                    onClick={() => onDeleteSource(source.id)}
                  >
                    {deletingSourceId === source.id ? 'DELETING…' : 'DELETE'}
                  </button>
                </Box>
                {source.url && (
                  <span className="crt-source-url">{source.url}</span>
                )}
                <p className="crt-doc-brief-text">{source.summary}</p>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
}
