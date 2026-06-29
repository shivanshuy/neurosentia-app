import Box from '@mui/material/Box';
import type { SessionSource } from '../chat/types';
import { hasEnabledSources, sourceDisplayLabel, sourceListLabel } from '../chat/sessionSources';

function sourceKindLabel(kind: SessionSource['kind']): string {
  if (kind === 'url') return 'URL';
  if (kind === 'image') return 'IMAGE';
  return 'FILE';
}

type ChatDocsPanelProps = {
  sources: SessionSource[];
  chatWithDocs: boolean;
  sourcesOnlyMode: boolean;
  onToggleChatWithDocs: (enabled: boolean) => void;
  onToggleSourcesOnly: (enabled: boolean) => void;
  onToggleSource: (id: string) => void;
};

export default function ChatDocsPanel({
  sources,
  chatWithDocs,
  sourcesOnlyMode,
  onToggleChatWithDocs,
  onToggleSourcesOnly,
  onToggleSource,
}: ChatDocsPanelProps) {
  return (
    <Box className="crt-chat-docs">
      <label className="crt-chat-docs-master">
        <input
          type="checkbox"
          checked={chatWithDocs}
          onChange={(e) => onToggleChatWithDocs(e.target.checked)}
        />
        CHAT WITH DOCS
      </label>

      {chatWithDocs && (
        <>
          <label className="crt-doc-only-toggle crt-doc-only-toggle--strict crt-chat-docs-strict">
            <input
              type="checkbox"
              checked={sourcesOnlyMode}
              onChange={(e) => onToggleSourcesOnly(e.target.checked)}
            />
            SOURCES ONLY (no model knowledge · no web search)
          </label>

          {sources.length === 0 ? (
            <p className="crt-chat-docs-hint">
              No documents ingested yet. Open the DOCUMENTS tab to upload files or URLs.
            </p>
          ) : (
            <Box className="crt-active-sources crt-active-sources--chat">
              <Box className="crt-active-sources-head">
                <span className="crt-active-sources-title">SELECT DOCS FOR THIS CHAT</span>
                <span className="crt-active-sources-count">{sourceListLabel(sources)}</span>
                {sourcesOnlyMode && (
                  <span className="crt-active-sources-strict">SOURCES ONLY</span>
                )}
              </Box>
              <ul className="crt-active-sources-list">
                {sources.map((source) => (
                  <li key={source.id} className="crt-active-source-item">
                    <label className="crt-source-toggle">
                      <input
                        type="checkbox"
                        checked={source.enabled}
                        onChange={() => onToggleSource(source.id)}
                      />
                      <span className="crt-source-name">{sourceDisplayLabel(source)}</span>
                      <span className="crt-source-kind">{sourceKindLabel(source.kind)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {sourcesOnlyMode && !hasEnabledSources(sources) && sources.length > 0 && (
            <Box className="crt-doc-gate crt-doc-gate--strict">
              SOURCES ONLY — CHECK AT LEAST ONE DOCUMENT OR TURN OFF STRICT MODE.
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
