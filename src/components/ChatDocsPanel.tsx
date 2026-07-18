import React from 'react';
import Box from '@mui/material/Box';
import type { SessionSource } from '../chat/types';
import {
  enabledSources,
  hasEnabledSources,
  sourceDisplayLabel,
  sourceListLabel,
} from '../chat/sessionSources';

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
  onClearSession: () => void;
  onNewSession: () => void;
};

export default function ChatDocsPanel({
  sources,
  chatWithDocs,
  sourcesOnlyMode,
  onToggleChatWithDocs,
  onToggleSourcesOnly,
  onToggleSource,
  onClearSession,
  onNewSession,
}: ChatDocsPanelProps) {
  const [docsExpanded, setDocsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (chatWithDocs) {
      setDocsExpanded(true);
    } else {
      setDocsExpanded(false);
    }
  }, [chatWithDocs]);

  const activeSources = enabledSources(sources);
  const collapsedLabel = sources.length === 0
    ? 'NO DOCUMENTS INGESTED'
    : sourceListLabel(sources);

  return (
    <Box className="crt-chat-docs">
      <Box className="crt-chat-docs-header">
        <label className="crt-chat-docs-master">
          <input
            type="checkbox"
            checked={chatWithDocs}
            onChange={(e) => onToggleChatWithDocs(e.target.checked)}
          />
          CHAT WITH DOCS
        </label>
        <Box className="crt-chat-docs-session-actions">
          <button type="button" className="crt-clear-btn" onClick={onClearSession}>
            CLR SESSION
          </button>
          <button type="button" className="crt-clear-btn" onClick={onNewSession}>
            NEW SESSION
          </button>
        </Box>
      </Box>

      {chatWithDocs && (
        <Box className={`crt-chat-docs-accordion${docsExpanded ? ' crt-chat-docs-accordion--open' : ''}`}>
          <button
            type="button"
            className="crt-chat-docs-accordion-trigger"
            aria-expanded={docsExpanded}
            onClick={() => setDocsExpanded((open) => !open)}
          >
            <span className="crt-chat-docs-accordion-icon" aria-hidden="true">
              {docsExpanded ? '▾' : '▸'}
            </span>
            <span
              className="crt-chat-docs-accordion-label"
              title={
                !docsExpanded && activeSources.length > 0
                  ? activeSources.map(sourceDisplayLabel).join(', ')
                  : undefined
              }
            >
              {docsExpanded ? 'SELECT DOCS FOR THIS CHAT' : collapsedLabel}
            </span>
            {sourcesOnlyMode && (
              <span className="crt-active-sources-strict">SOURCES ONLY</span>
            )}
            {docsExpanded && sources.length > 0 && (
              <span className="crt-chat-docs-accordion-count">{sourceListLabel(sources)}</span>
            )}
          </button>

          {docsExpanded && (
            <Box className="crt-chat-docs-accordion-body">
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
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
