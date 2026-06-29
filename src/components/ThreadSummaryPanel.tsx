import * as React from 'react';

import Box from '@mui/material/Box';

import Tooltip from '@mui/material/Tooltip';

import { FaCopy, FaDownload, FaRedo } from 'react-icons/fa';

import { exportSummary } from '../chat/export';

import { formatThreadId } from '../chatHistory';

import MermaidDiagram from './MermaidDiagram';



type ThreadSummaryPanelProps = {

  summary: string | null;

  mermaid: string | null;

  isSummarizing: boolean;

  error: string | null;

  sessionId: string | null;

  title: string;

  messageCount: number;

  onRefresh: () => void;

};



export default function ThreadSummaryPanel({

  summary,

  mermaid,

  isSummarizing,

  error,

  sessionId,

  title,

  messageCount,

  onRefresh,

}: ThreadSummaryPanelProps) {

  const [copied, setCopied] = React.useState(false);



  const copyPayload = React.useMemo(() => {

    if (!summary) return '';

    if (!mermaid?.trim()) return summary;

    return `${summary}\n\n\`\`\`mermaid\n${mermaid.trim()}\n\`\`\``;

  }, [summary, mermaid]);



  const handleCopy = async () => {

    if (!copyPayload) return;

    try {

      await navigator.clipboard.writeText(copyPayload);

      setCopied(true);

      window.setTimeout(() => setCopied(false), 1800);

    } catch {

      /* clipboard unavailable */

    }

  };



  return (

    <Box className="crt-panel crt-chat-panel crt-summary-panel">

      <Box className="crt-messages crt-summary-messages">

        <Box className="crt-summary-meta">

          <span className="crt-summary-title">THREAD SUMMARY</span>

          <span className="crt-summary-stats">

            {formatThreadId(sessionId)} · {messageCount} MSG

          </span>

        </Box>



        {isSummarizing && (

          <Box className="crt-summary-loading" aria-live="polite" aria-busy="true">

            <p className="crt-line-body">

              <span className="crt-line-prompt" aria-hidden="true">&gt;</span>

              <span className="crt-speaker">TURING</span>

              <span className="crt-text crt-typing" aria-label="Summarizing thread">

                <span>█</span>

                <span>█</span>

                <span>█</span>

              </span>

            </p>

            <Box className="crt-summary-progress" role="progressbar" aria-label="Summarization in progress">

              <Box className="crt-summary-progress-bar" />

            </Box>

            <span className="crt-summary-progress-label">READING THREAD FROM SERVER…</span>

          </Box>

        )}



        {!isSummarizing && error && (

          <p className="crt-line crt-line--error crt-line-body">

            <span className="crt-line-prompt" aria-hidden="true">&gt;</span>

            <span className="crt-speaker">SYSTEM</span>

            <span className="crt-text">{error}</span>

          </p>

        )}



        {!isSummarizing && !error && summary && (

          <p className="crt-line-body">

            <span className="crt-line-prompt" aria-hidden="true">&gt;</span>

            <span className="crt-speaker">SUMMARY</span>

            <span className="crt-text">{summary}</span>

          </p>

        )}



        {!isSummarizing && !error && mermaid?.trim() && (

          <Box className="crt-summary-diagram">

            <span className="crt-map-section-label">▸ LINE DIAGRAM</span>

            <MermaidDiagram chart={mermaid} diagramId="summary" />

          </Box>

        )}



        {!isSummarizing && !error && !summary && (

          <p className="crt-line-body">

            <span className="crt-line-prompt" aria-hidden="true">&gt;</span>

            <span className="crt-speaker">SYSTEM</span>

            <span className="crt-text">

              NO SUMMARY YET. PRESS SUMMARIZE TO GENERATE FROM THE SERVER THREAD.

            </span>

          </p>

        )}

      </Box>



      <Box className="crt-msg-actions crt-summary-actions">

        <Tooltip title={copied ? 'COPIED' : 'COPY'}>

          <button

            type="button"

            className="crt-recording-action-btn"

            disabled={!summary || isSummarizing}

            onClick={() => void handleCopy()}

          >

            <FaCopy /> COPY

          </button>

        </Tooltip>

        <button

          type="button"

          className="crt-recording-action-btn"

          disabled={!summary || isSummarizing}

          onClick={() => exportSummary(summary ?? '', title, 'md', mermaid ?? undefined)}

        >

          <FaDownload /> MD

        </button>

        <button

          type="button"

          className="crt-recording-action-btn"

          disabled={!summary || isSummarizing}

          onClick={() => exportSummary(summary ?? '', title, 'txt', mermaid ?? undefined)}

        >

          <FaDownload /> TXT

        </button>

        <button

          type="button"

          className="crt-recording-action-btn"

          disabled={!sessionId || isSummarizing}

          onClick={onRefresh}

        >

          <FaRedo /> REFRESH

        </button>

      </Box>

    </Box>

  );

}

