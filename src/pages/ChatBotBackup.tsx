/**
 * Frozen backup of the CRT chatbot design (agent-info sidebar layout).
 * Route: /chatterbug-backup
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { FaCopy, FaRedo } from 'react-icons/fa';
import { getAIMessage } from '../ApiImpl';
import logoIcon from '../assets/logo-icon.png';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  error?: boolean;
};

const TABS = ['CHAT', 'CONTACTS', 'LOC', 'DOCUMENTS', 'ORDERS', 'RECORDINGS', 'MAP'] as const;

const CHAR_GRID = ['à', 'ç', 'ć', 'þ', 'æ', '§', 'č', 'ž', 'ñ', 'ø', 'ü', 'ß', 'ð', 'ł', 'ą', 'ę'];

const SUGGESTED_PROMPTS = [
  'What can Neurosentia help me build?',
  'Explain RAG for a product team.',
  'How do I scope an AI chatbot in 4 weeks?',
  'What is the Ultimate Question?',
];

const AGENT_BIO =
  'TURING\'S DREAM IS A NEUROSENTIA CONVERSATIONAL INTERFACE BUILT ON LARGE-LANGUAGE-MODEL '
  + 'INFRASTRUCTURE. THE SYSTEM HANDLES PRODUCT INQUIRIES, AI ARCHITECTURE QUESTIONS, AND '
  + 'IMPLEMENTATION GUIDANCE. SESSIONS ARE STATEFUL VIA SECURE GATEWAY ENDPOINTS. ALL '
  + 'TRANSMISSIONS ARE LOGGED FOR QUALITY ASSURANCE. OPERATORS SHOULD VERIFY CRITICAL OUTPUT '
  + 'BEFORE DEPLOYMENT TO PRODUCTION ENVIRONMENTS.';

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function speakerLabel(role: ChatRole) {
  return role === 'user' ? 'YOU' : "TURING'S DREAM";
}

export default function ChatBotBackup() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = React.useCallback(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const requestAssistantReply = React.useCallback(async (text: string) => {
    setIsLoading(true);

    try {
      const response = await getAIMessage(text, sessionId);
      const nextSessionId = response.data.sessionId as string | undefined;
      const assistantContent = response.data.message?.content ?? '';

      if (nextSessionId) {
        setSessionId(nextSessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: 'assistant',
          content: assistantContent || 'I received your message but had nothing to say back.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: 'assistant',
          content: 'Connection lost. Please try again.',
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [sessionId]);

  const sendMessage = React.useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isLoading) return;

      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: 'user', content: text },
      ]);
      setInput('');
      await requestAssistantReply(text);
    },
    [isLoading, requestAssistantReply],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const startNewThread = () => {
    setMessages([]);
    setSessionId(null);
    setInput('');
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const retryLast = () => {
    if (isLoading) return;

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    setMessages((prev) => {
      let lastErrorIndex = -1;
      for (let i = prev.length - 1; i >= 0; i -= 1) {
        if (prev[i].error) {
          lastErrorIndex = i;
          break;
        }
      }
      if (lastErrorIndex === -1) return prev;
      return prev.slice(0, lastErrorIndex);
    });

    void requestAssistantReply(lastUser.content);
  };

  const hasError = messages.some((m) => m.error);
  const showWelcome = messages.length === 0 && !isLoading;
  const statusText = hasError ? 'LOW SIGNAL' : isLoading ? 'BUFFERING...' : 'SIGNAL OK';
  const sessionDisplay = sessionId ? sessionId.slice(0, 18).toUpperCase() : 'NONE';

  return (
    <Box className="app-content-page turing-chat-page">
      <Box className="crt-terminal">
        <Box className="crt-scanlines" aria-hidden="true" />
        <Box className="crt-glow" aria-hidden="true" />

        <Box className="crt-frame">
          <Box className="crt-top-bar">
            <span className="crt-version">ARCHIVE · NSYS PLC 2.4.00</span>
            <button type="button" className="crt-clear-btn" onClick={startNewThread}>
              CLR SESSION
            </button>
          </Box>

          <Box className="crt-tabs" role="tablist" aria-label="Terminal sections">
            {TABS.map((tab) => (
              <span
                key={tab}
                role="tab"
                aria-selected={tab === 'CHAT'}
                className={`crt-tab${tab === 'CHAT' ? ' crt-tab--active' : ''}`}
              >
                {tab}
              </span>
            ))}
          </Box>

          <Box className="crt-body">
            <Box className="crt-panel crt-sidebar" component="aside">
              <Box className="crt-sidebar-title">AGENT INFO:</Box>

              <Box className="crt-profile-row">
                <Box className="crt-photo-wrap">
                  <img src={logoIcon} alt="" className="crt-photo" />
                </Box>
                <Box className="crt-fields">
                  <Box className="crt-field">
                    <span className="crt-field-label">AGENT:</span> TD-47-AI
                  </Box>
                  <Box className="crt-field">
                    <span className="crt-field-label">LEGAL NAME:</span> TURING&apos;S DREAM
                  </Box>
                  <Box className="crt-field">
                    <span className="crt-field-label">SESSION:</span> {sessionDisplay}
                  </Box>
                  <Box className="crt-field">
                    <span className="crt-field-label">GATEWAY:</span> NEUROSENTIA-GW
                  </Box>
                </Box>
              </Box>

              <Box className="crt-bio">{AGENT_BIO}</Box>
            </Box>

            <Box className="crt-main">
              <Box className="crt-panel crt-chat-panel">
                <Box className="crt-messages" role="log" aria-live="polite" aria-relevant="additions">
                  {showWelcome && (
                    <Box className="crt-line crt-line--system">
                      <span className="crt-speaker">SYSTEM</span>
                      <span className="crt-text">
                        CHANNEL OPEN. SELECT A QUERY LINE OR ENTER TRANSMISSION BELOW.
                      </span>
                    </Box>
                  )}

                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      className={`crt-line crt-line--${message.role}${message.error ? ' crt-line--error' : ''}`}
                    >
                      <span className="crt-speaker">{speakerLabel(message.role)}</span>
                      <span className="crt-text">{message.content}</span>
                      {message.role === 'assistant' && (
                        <Tooltip title={copiedId === message.id ? 'COPIED' : 'COPY'}>
                          <button
                            type="button"
                            className="crt-copy-btn"
                            onClick={() => void copyMessage(message)}
                            aria-label="Copy message"
                          >
                            <FaCopy />
                          </button>
                        </Tooltip>
                      )}
                    </Box>
                  ))}

                  {isLoading && (
                    <Box className="crt-line crt-line--assistant">
                      <span className="crt-speaker">TURING&apos;S DREAM</span>
                      <span className="crt-text crt-typing" aria-label="Receiving">
                        <span>█</span>
                        <span>█</span>
                        <span>█</span>
                      </span>
                    </Box>
                  )}

                  <div ref={scrollAnchorRef} />
                </Box>
              </Box>

              {showWelcome && (
                <Box className="crt-prompts" aria-label="Suggested prompts">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <button
                      key={prompt}
                      type="button"
                      className="crt-prompt-line"
                      onClick={() => void sendMessage(prompt)}
                      disabled={isLoading}
                    >
                      <span className="crt-prompt-num">L{index + 1}</span>
                      {prompt.toUpperCase()}
                    </button>
                  ))}
                </Box>
              )}

              {hasError && (
                <Box className="crt-error-bar">
                  <span>TRANSMISSION FAILED — CARRIER LOST.</span>
                  <button type="button" className="crt-retry-btn" onClick={retryLast}>
                    <FaRedo aria-hidden="true" />
                    RETRY
                  </button>
                </Box>
              )}

              <Box className="crt-input-row" component="form" onSubmit={handleSubmit}>
                <Box className="crt-panel crt-input-panel">
                  <textarea
                    ref={inputRef}
                    className="crt-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="ENTER TRANSMISSION..."
                    rows={3}
                    disabled={isLoading}
                    aria-label="Message input"
                  />
                </Box>

                <Box className="crt-input-side">
                  <Box className="crt-char-grid" aria-hidden="true">
                    {CHAR_GRID.map((ch) => (
                      <span key={ch}>{ch}</span>
                    ))}
                  </Box>
                  <button
                    type="submit"
                    className="crt-send-btn"
                    disabled={!input.trim() || isLoading}
                  >
                    SEND
                  </button>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="crt-footer" component="footer">
            <span className="crt-footer-status">{statusText}</span>
            <span className="crt-footer-owner">PROPERTY OF NEUROSENTIA SYSTEMS · BACKUP BUILD</span>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
