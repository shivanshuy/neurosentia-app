import Box from '@mui/material/Box';
import { FaDownload, FaPen, FaThumbtack, FaTrash } from 'react-icons/fa';
import type { ChatConversation } from '../chatHistory';
import {
  formatHistoryTimestamp,
  getConversationDisplayTitle,
} from '../chatHistory';

type RecordingsPanelProps = {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  activeConversation: ChatConversation | null;
  recordingQuery: string;
  recordingFrom: string;
  recordingTo: string;
  renamingId: string | null;
  renameDraft: string;
  isLoading: boolean;
  isResuming: boolean;
  onQueryChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onRenameDraftChange: (value: string) => void;
  onResume: (conversation: ChatConversation) => void;
  onTogglePin: (conversationId: string) => void;
  onStartRename: (conversationId: string, title: string) => void;
  onCommitRename: (conversationId: string) => void;
  onCancelRename: () => void;
  onExport: (conversation: ChatConversation, format: 'md' | 'txt') => void;
  onRemove: (conversationId: string) => void;
};

export default function RecordingsPanel({
  conversations,
  activeConversationId,
  activeConversation,
  recordingQuery,
  recordingFrom,
  recordingTo,
  renamingId,
  renameDraft,
  isLoading,
  isResuming,
  onQueryChange,
  onFromChange,
  onToChange,
  onRenameDraftChange,
  onResume,
  onTogglePin,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onExport,
  onRemove,
}: RecordingsPanelProps) {
  return (
    <Box className="crt-panel crt-recordings-panel">
      <Box className="crt-doc-header">
        <span className="crt-doc-title">RECORDINGS</span>
        <span className="crt-doc-stats">{conversations.length} SAVED</span>
      </Box>

      <p className="crt-doc-hint">
        Search and reopen past transmissions. Select a recording to resume the thread on the CHAT tab.
      </p>

      <Box className="crt-recording-search">
        <input
          className="crt-recording-search-input"
          value={recordingQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="SEARCH..."
          aria-label="Search recordings"
        />
        <Box className="crt-recording-dates">
          <input
            type="date"
            className="crt-recording-date"
            value={recordingFrom}
            onChange={(e) => onFromChange(e.target.value)}
            aria-label="From date"
          />
          <input
            type="date"
            className="crt-recording-date"
            value={recordingTo}
            onChange={(e) => onToChange(e.target.value)}
            aria-label="To date"
          />
        </Box>
      </Box>

      {activeConversation && (
        <Box className="crt-recording-actions">
          <button
            type="button"
            className="crt-recording-action-btn"
            onClick={() => onExport(activeConversation, 'md')}
          >
            <FaDownload /> EXPORT MD
          </button>
          <button
            type="button"
            className="crt-recording-action-btn"
            onClick={() => onExport(activeConversation, 'txt')}
          >
            <FaDownload /> EXPORT TXT
          </button>
        </Box>
      )}

      <Box className="crt-history-list crt-history-list--panel" role="list">
        {conversations.length === 0 ? (
          <Box className="crt-history-empty">NO MATCHING RECORDINGS.</Box>
        ) : (
          conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            const displayTitle = getConversationDisplayTitle(conversation);
            const isRenaming = renamingId === conversation.id;

            return (
              <Box
                key={conversation.id}
                role="listitem"
                className={`crt-history-item${isActive ? ' crt-history-item--active' : ''}`}
              >
                {isRenaming ? (
                  <input
                    className="crt-rename-input"
                    value={renameDraft}
                    onChange={(e) => onRenameDraftChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onCommitRename(conversation.id);
                      if (e.key === 'Escape') onCancelRename();
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      className="crt-history-item-main"
                      onClick={() => onResume(conversation)}
                      disabled={isLoading || isResuming}
                    >
                      <span className="crt-history-item-title">
                        {conversation.pinned ? '📌 ' : ''}
                        {displayTitle.toUpperCase()}
                      </span>
                      <span className="crt-history-item-meta">
                        {formatHistoryTimestamp(conversation.updatedAt)}
                        {' · '}
                        {conversation.messages.length} MSG
                      </span>
                    </button>
                    <Box className="crt-history-item-tools">
                      <button
                        type="button"
                        className="crt-history-tool-btn"
                        title="Pin"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(conversation.id);
                        }}
                      >
                        <FaThumbtack />
                      </button>
                      <button
                        type="button"
                        className="crt-history-tool-btn"
                        title="Rename"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartRename(conversation.id, displayTitle);
                        }}
                      >
                        <FaPen />
                      </button>
                      <button
                        type="button"
                        className="crt-history-tool-btn"
                        title="Export MD"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExport(conversation, 'md');
                        }}
                      >
                        <FaDownload />
                      </button>
                      <button
                        type="button"
                        className="crt-history-tool-btn crt-history-tool-btn--danger"
                        title="Remove"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(conversation.id);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </Box>
                  </>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
