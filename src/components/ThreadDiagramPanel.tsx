import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { FaCopy, FaDownload, FaRedo } from 'react-icons/fa';
import { exportDiagram } from '../chat/export';
import { formatThreadId } from '../chatHistory';
import MermaidDiagram from './MermaidDiagram';

type ThreadDiagramPanelProps = {
  mermaid: string | null;
  isDiagramming: boolean;
  error: string | null;
  sessionId: string | null;
  title: string;
  messageCount: number;
  onRefresh: () => void;
};

export default function ThreadDiagramPanel({
  mermaid,
  isDiagramming,
  error,
  sessionId,
  title,
  messageCount,
  onRefresh,
}: ThreadDiagramPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!mermaid?.trim()) return;
    try {
      await navigator.clipboard.writeText(mermaid.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Box className="crt-panel crt-chat-panel crt-summary-panel crt-diagram-panel">
      <Box className="crt-messages crt-summary-messages">
        <Box className="crt-summary-meta">
          <span className="crt-summary-title">LINE DIAGRAM</span>
          <span className="crt-summary-stats">
            {formatThreadId(sessionId)} · {messageCount} MSG
          </span>
        </Box>

        {isDiagramming && (
          <Box className="crt-summary-loading" aria-live="polite" aria-busy="true">
            <p className="crt-line-body">
              <span className="crt-line-prompt" aria-hidden="true">&gt;</span>
              <span className="crt-speaker">TURING</span>
              <span className="crt-text crt-typing" aria-label="Generating line diagram">
                <span>█</span>
                <span>█</span>
                <span>█</span>
              </span>
            </p>
            <Box className="crt-summary-progress" role="progressbar" aria-label="Diagram generation in progress">
              <Box className="crt-summary-progress-bar" />
            </Box>
            <span className="crt-summary-progress-label">BUILDING MERMAID FLOWCHART FROM SERVER THREAD…</span>
          </Box>
        )}

        {!isDiagramming && error && (
          <p className="crt-line crt-line--error crt-line-body">
            <span className="crt-line-prompt" aria-hidden="true">&gt;</span>
            <span className="crt-speaker">SYSTEM</span>
            <span className="crt-text">{error}</span>
          </p>
        )}

        {!isDiagramming && !error && mermaid?.trim() && (
          <Box className="crt-diagram-render">
            <MermaidDiagram chart={mermaid} diagramId="diagram-panel" />
          </Box>
        )}

        {!isDiagramming && !error && !mermaid?.trim() && (
          <p className="crt-line-body">
            <span className="crt-line-prompt" aria-hidden="true">&gt;</span>
            <span className="crt-speaker">SYSTEM</span>
            <span className="crt-text">
              NO DIAGRAM YET. PRESS DIAGRAM TO GENERATE A FLOWCHART FROM THE SERVER THREAD.
            </span>
          </p>
        )}
      </Box>

      <Box className="crt-msg-actions crt-summary-actions">
        <Tooltip title={copied ? 'COPIED' : 'COPY'}>
          <button
            type="button"
            className="crt-recording-action-btn"
            disabled={!mermaid?.trim() || isDiagramming}
            onClick={() => void handleCopy()}
          >
            <FaCopy /> COPY
          </button>
        </Tooltip>
        <button
          type="button"
          className="crt-recording-action-btn"
          disabled={!mermaid?.trim() || isDiagramming}
          onClick={() => exportDiagram(mermaid ?? '', title, 'md')}
        >
          <FaDownload /> MD
        </button>
        <button
          type="button"
          className="crt-recording-action-btn"
          disabled={!mermaid?.trim() || isDiagramming}
          onClick={() => exportDiagram(mermaid ?? '', title, 'txt')}
        >
          <FaDownload /> TXT
        </button>
        <button
          type="button"
          className="crt-recording-action-btn"
          disabled={!sessionId || isDiagramming}
          onClick={onRefresh}
        >
          <FaRedo /> REGENERATE
        </button>
      </Box>
    </Box>
  );
}
