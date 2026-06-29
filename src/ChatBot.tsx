import * as React from 'react';
import { flushSync } from 'react-dom';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {
  FaCopy,
  FaDownload,
  FaEdit,
  FaMapMarkerAlt,
  FaMicrophone,
  FaPaperclip,
  FaPen,
  FaRedo,
  FaStop,
  FaThumbtack,
  FaTimes,
  FaTrash,
  FaVolumeUp,
} from 'react-icons/fa';
import {
  deleteDocumentSource,
  diagramThread,
  fetchToolTraces,
  fetchThreadMessages,
  ingestDocument,
  ingestImage,
  ingestUrl,
  LONG_THREAD_MESSAGE_COUNT,
  streamAIMessage,
  summarizeThread,
} from './ApiImpl';
import { assessSearchSignal } from './chat/confidence';
import { exportConversation, exportMessages } from './chat/export';
import { buildMessageWithAttachments, extractSingleFileTextForIngest } from './chat/fileExtract';
import { loadMemoryPins, saveMemoryPins } from './chat/memoryPins';
import { extractMermaidBlocks, stripMermaidFences } from './chat/mermaid';
import { parseOperatorNotes } from './chat/operatorNotes';
import {
  loadPersonaMode,
  loadUserLocation,
  savePersonaMode,
  saveUserLocation,
} from './chat/preferences';
import { loadTransmissionTemplates, saveTransmissionTemplates } from './chat/templates';
import { isTtsSupported, speakText } from './chat/tts';
import type { ChatMessage, ChatPersonaMode, SessionSource } from './chat/types';
import type { ImageIngestMode } from './chat/imageIngest';
import {
  createFileSource,
  createImageSource,
  createUrlSource,
  hasEnabledSources,
  legacySourcesFromConversation,
  removeSource,
  toggleSourceEnabled,
} from './chat/sessionSources';
import type { ToolTrace } from './chat/toolTrace';
import { isVoiceInputSupported, listenOnce } from './chat/voice';
import logoIcon from './assets/logo-icon.png';
import {
  type ChatConversation,
  createMessageId,
  filterConversations,
  formatHistoryTimestamp,
  formatMessageTimestamp,
  formatThreadId,
  getConversationDisplayTitle,
  loadChatHistory,
  persistActiveConversation,
  removeConversation,
  renameConversation,
  togglePinConversation,
  upsertConversation,
} from './chatHistory';
import ThreadContextMap from './components/ThreadContextMap';
import MermaidDiagram from './components/MermaidDiagram';
import ThreadDiagramPanel from './components/ThreadDiagramPanel';
import ThreadSummaryPanel from './components/ThreadSummaryPanel';
import ConfidenceStrip from './components/ConfidenceStrip';
import ToolTracePanel from './components/ToolTracePanel';
import TimelineRail from './components/TimelineRail';
import EntityHeatMap from './components/EntityHeatMap';
import MemoryPinsPanel from './components/MemoryPinsPanel';
import AudioChannel from './components/AudioChannel';
import DocumentSessionPanel from './components/DocumentSessionPanel';
import ChatDocsPanel from './components/ChatDocsPanel';

const TABS = ['CHAT', 'CONTACTS', 'LOC', 'DOCUMENTS', 'ORDERS', 'RECORDINGS', 'MAP'] as const;
type TerminalTab = (typeof TABS)[number];

const ACCEPTED_FILE_TYPES =
  'image/*,.pdf,.txt,.md,.doc,.docx,.csv,.json,.xml,.yaml,.yml,.html,.htm';

const AUTO_SUMMARY_COOLDOWN_MS = 5 * 60 * 1000;

const AGENT_BIO =
  'TURING\'S DREAM IS A NEUROSENTIA CONVERSATIONAL INTERFACE BUILT ON LARGE-LANGUAGE-MODEL '
  + 'INFRASTRUCTURE. THE SYSTEM HANDLES PRODUCT INQUIRIES, AI ARCHITECTURE QUESTIONS, AND '
  + 'IMPLEMENTATION GUIDANCE. SESSIONS ARE STATEFUL VIA LANGGRAPH THREADS ON NEUROSENTIA-SERVE. ALL '
  + 'TRANSMISSIONS ARE LOGGED FOR QUALITY ASSURANCE. OPERATORS SHOULD VERIFY CRITICAL OUTPUT '
  + 'BEFORE DEPLOYMENT TO PRODUCTION ENVIRONMENTS.';

function speakerLabel(role: ChatMessage['role']) {
  return role === 'user' ? 'YOU' : 'TURING';
}

function formatTransmitterClock(date: Date) {
  const day = date.toLocaleDateString(undefined, { day: '2-digit' });
  const month = date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${day} ${month} ${year} · ${time}`;
}

export default function ChatBot() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<ChatConversation[]>(() => loadChatHistory());
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResuming, setIsResuming] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);
  const [clock, setClock] = React.useState(() => new Date());
  const [userLocation, setUserLocation] = React.useState(() => loadUserLocation());
  const [personaMode, setPersonaMode] = React.useState<ChatPersonaMode>(() => loadPersonaMode());
  const [recordingQuery, setRecordingQuery] = React.useState('');
  const [recordingFrom, setRecordingFrom] = React.useState('');
  const [recordingTo, setRecordingTo] = React.useState('');
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState('');
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameDraft, setRenameDraft] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [voiceError, setVoiceError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TerminalTab>('CHAT');
  const [showSummaryPanel, setShowSummaryPanel] = React.useState(false);
  const [showDiagramPanel, setShowDiagramPanel] = React.useState(false);
  const [threadSummary, setThreadSummary] = React.useState<string | null>(null);
  const [threadMermaid, setThreadMermaid] = React.useState<string | null>(null);
  const [summaryMessageCount, setSummaryMessageCount] = React.useState(0);
  const [diagramMessageCount, setDiagramMessageCount] = React.useState(0);
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isDiagramming, setIsDiagramming] = React.useState(false);
  const [summarizeError, setSummarizeError] = React.useState<string | null>(null);
  const [diagramError, setDiagramError] = React.useState<string | null>(null);
  const [memoryPins, setMemoryPins] = React.useState<string[]>(() => loadMemoryPins());
  const [transmissionTemplates, setTransmissionTemplates] = React.useState<string[]>(() =>
    loadTransmissionTemplates(),
  );
  const [editingTemplates, setEditingTemplates] = React.useState(false);
  const [templateDrafts, setTemplateDrafts] = React.useState<string[]>([]);
  const [toolTraces, setToolTraces] = React.useState<ToolTrace[]>([]);
  const [showTracePanel, setShowTracePanel] = React.useState(false);
  const [sessionSources, setSessionSources] = React.useState<SessionSource[]>([]);
  const [chatWithDocs, setChatWithDocs] = React.useState(false);
  const [sourcesOnlyMode, setSourcesOnlyMode] = React.useState(false);
  const [isIngesting, setIsIngesting] = React.useState(false);
  const [deletingSourceId, setDeletingSourceId] = React.useState<string | null>(null);
  const [ingestError, setIngestError] = React.useState<string | null>(null);
  const [rollingSummary, setRollingSummary] = React.useState<string | null>(null);
  const [rollingSummaryAt, setRollingSummaryAt] = React.useState<number | null>(null);
  const [ttsActive, setTtsActive] = React.useState(false);
  const [vuLevel, setVuLevel] = React.useState(0);

  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const persistSkipRef = React.useRef(false);
  const activeConversationIdRef = React.useRef<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const voiceStopRef = React.useRef<(() => void) | null>(null);
  const ttsStopRef = React.useRef<(() => void) | null>(null);

  const conversationMeta = React.useMemo(
    () => ({
      sessionSources,
      chatWithDocs,
      sourcesOnlyMode: chatWithDocs ? sourcesOnlyMode : false,
      rollingSummary: rollingSummary ?? undefined,
      rollingSummaryAt: rollingSummaryAt ?? undefined,
    }),
    [sessionSources, chatWithDocs, sourcesOnlyMode, rollingSummary, rollingSummaryAt],
  );

  const effectiveSourcesOnly = chatWithDocs && sourcesOnlyMode;
  const chatSessionSources = chatWithDocs ? sessionSources : [];

  React.useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  React.useEffect(() => () => {
    abortRef.current?.abort();
    voiceStopRef.current?.();
    ttsStopRef.current?.();
  }, []);

  const scrollToBottom = React.useCallback(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  React.useEffect(() => {
    const tick = () => setClock(new Date());
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    if (persistSkipRef.current) {
      persistSkipRef.current = false;
      return;
    }
    if (messages.length === 0) return;

    setConversations((prev) => {
      const { conversations: next, activeId } = upsertConversation(
        prev,
        activeConversationIdRef.current,
        messages,
        sessionId,
        conversationMeta,
      );
      if (activeId !== activeConversationIdRef.current) {
        activeConversationIdRef.current = activeId;
        setActiveConversationId(activeId);
      }
      return next;
    });
  }, [messages, sessionId, conversationMeta]);

  const stopGeneration = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const requestAssistantReply = React.useCallback(async (text: string) => {
    setIsLoading(true);
    const assistantMessageId = createMessageId();
    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = performance.now();

    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '', timestamp: Date.now() },
    ]);

    try {
      const result = await streamAIMessage(
        text,
        sessionId,
        (partialContent) => {
          flushSync(() => {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, content: partialContent }
                  : message,
              ),
            );
          });
        },
        {
          signal: controller.signal,
          persona: personaMode,
          location: userLocation,
          memoryPins: effectiveSourcesOnly ? [] : memoryPins,
          sessionSources: chatSessionSources,
          sourcesOnlyMode: effectiveSourcesOnly,
          rollingSummary: effectiveSourcesOnly ? null : rollingSummary,
        },
      );

      if (result.sessionId) setSessionId(result.sessionId);

      const latencyMs = Math.round(performance.now() - startedAt);
      const signal = assessSearchSignal(result.sources);
      const traces = result.sessionId
        ? await fetchToolTraces(result.sessionId, latencyMs)
        : [];
      if (traces.length) setToolTraces(traces);

      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== assistantMessageId) return message;
          if (result.cancelled) {
            return {
              ...message,
              content: message.content.trim()
                ? `${message.content.trim()}\n\n[transmission halted]`
                : '[transmission halted]',
              cancelled: true,
            };
          }
          if (!result.content.trim()) {
            return {
              ...message,
              content: 'I received your message but had nothing to say back.',
            };
          }
          return {
            ...message,
            content: result.content,
            sources: result.sources.length ? result.sources : undefined,
            searchSignal: signal ?? undefined,
            toolLatencyMs: traces[0]?.latencyMs ?? latencyMs,
          };
        }),
      );

      const nextCount = messages.filter((m) => m.content.trim()).length + 2;
      if (
        !effectiveSourcesOnly
        && result.sessionId
        && nextCount >= LONG_THREAD_MESSAGE_COUNT
        && (!rollingSummaryAt || Date.now() - rollingSummaryAt > AUTO_SUMMARY_COOLDOWN_MS)
      ) {
        void summarizeThread(result.sessionId)
          .then((summaryResult) => {
            setRollingSummary(summaryResult.summary);
            setRollingSummaryAt(Date.now());
          })
          .catch(() => undefined);
      }
    } catch {
      if (!controller.signal.aborted) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: 'Connection lost. Please try again.',
                  error: true,
                }
              : message,
          ),
        );
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [
    memoryPins,
    messages,
    personaMode,
    rollingSummary,
    rollingSummaryAt,
    chatSessionSources,
    chatWithDocs,
    effectiveSourcesOnly,
    sessionId,
    userLocation,
  ]);

  const handleDiagramThread = React.useCallback(async () => {
    if (!sessionId || isLoading || isDiagramming || isSummarizing) return;

    setShowDiagramPanel(true);
    setShowSummaryPanel(false);
    setIsDiagramming(true);
    setDiagramError(null);

    try {
      const result = await diagramThread(sessionId);
      setThreadMermaid(result.mermaid);
      setDiagramMessageCount(result.messageCount);
    } catch {
      setDiagramError('Diagram generation failed — is neurosentia-serve running?');
    } finally {
      setIsDiagramming(false);
    }
  }, [sessionId, isLoading, isDiagramming, isSummarizing]);

  const sendMessage = React.useCallback(
    async (rawText: string, files: File[] = attachedFiles) => {
      if ((!rawText.trim() && files.length === 0) || isLoading || isExtracting) return;

      if (effectiveSourcesOnly && !hasEnabledSources(chatSessionSources) && files.length === 0) {
        setIngestError('SOURCES ONLY — CHECK AT LEAST ONE DOCUMENT IN CHAT, OR TURN OFF STRICT MODE.');
        return;
      }

      const trimmed = rawText.trim();
      if (trimmed.toLowerCase() === '/diagram' || trimmed.toLowerCase().startsWith('/diagram ')) {
        setInput('');
        setAttachedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        void handleDiagramThread();
        return;
      }

      setVoiceError(null);
      setSummarizeError(null);
      setDiagramError(null);
      setThreadSummary(null);
      setThreadMermaid(null);
      setShowSummaryPanel(false);
      setShowDiagramPanel(false);

      setIsExtracting(true);
      let outgoing = rawText.trim();
      try {
        outgoing = await buildMessageWithAttachments(rawText, files);
      } finally {
        setIsExtracting(false);
      }

      const { modelText, operatorNotes } = parseOperatorNotes(outgoing);
      if (!modelText.trim()) return;

      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: 'user',
          content: modelText,
          timestamp: Date.now(),
          operatorNotes: operatorNotes.length ? operatorNotes : undefined,
        },
      ]);
      setInput('');
      setAttachedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await requestAssistantReply(modelText);
    },
    [
      attachedFiles,
      handleDiagramThread,
      isExtracting,
      isLoading,
      requestAssistantReply,
      chatSessionSources,
      chatWithDocs,
      effectiveSourcesOnly,
    ],
  );

  const regenerateFrom = React.useCallback(
    (userText: string) => {
      if (isLoading || !userText.trim()) return;
      setMessages((prev) => {
        const lastUserIdx = prev.map((m) => m.role).lastIndexOf('user');
        if (lastUserIdx === -1) return prev;
        return prev.slice(0, lastUserIdx + 1);
      });
      void requestAssistantReply(userText);
    },
    [isLoading, requestAssistantReply],
  );

  const startEditMessage = (message: ChatMessage) => {
    if (isLoading || message.role !== 'user') return;
    setEditingMessageId(message.id);
    setEditDraft(message.content.split('\n[ATTACHMENT CONTENT]')[0]?.trim() ?? message.content);
  };

  const submitEditMessage = async () => {
    if (!editingMessageId || !editDraft.trim() || isLoading) return;
    setVoiceError(null);
    const draft = editDraft.trim();
    setEditingMessageId(null);
    setEditDraft('');
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === editingMessageId);
      if (idx === -1) return prev;
      const next = prev.slice(0, idx);
      next.push({ id: createMessageId(), role: 'user', content: draft, timestamp: Date.now() });
      return next;
    });
    await requestAssistantReply(draft);
  };

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files;
    if (!picked?.length) return;
    setAttachedFiles((prev) => {
      const next = [...prev];
      Array.from(picked).forEach((file) => {
        if (!next.some((e) => e.name === file.name && e.size === file.size)) next.push(file);
      });
      return next;
    });
    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleVoice = () => {
    if (!isVoiceInputSupported()) {
      setVoiceError('Voice not supported in this browser.');
      return;
    }
    if (isListening) {
      voiceStopRef.current?.();
      voiceStopRef.current = null;
      setIsListening(false);
      return;
    }
    setVoiceError(null);
    setIsListening(true);
    const session = listenOnce(
      (text) => setInput((prev) => (prev ? `${prev} ${text}` : text)),
      (message) => setVoiceError(message),
    );
    voiceStopRef.current = session.stop;
    window.setTimeout(() => {
      session.stop();
      setIsListening(false);
      voiceStopRef.current = null;
    }, 12_000);
  };

  const canTransmit = Boolean(input.trim() || attachedFiles.length) && !isLoading && !isExtracting;

  const startNewThread = () => {
    stopGeneration();
    setConversations((prev) =>
      persistActiveConversation(prev, activeConversationIdRef.current, messages, sessionId),
    );
    persistSkipRef.current = true;
    activeConversationIdRef.current = null;
    setMessages([]);
    setSessionId(null);
    setActiveConversationId(null);
    setInput('');
    setAttachedFiles([]);
    setEditingMessageId(null);
    setThreadSummary(null);
    setThreadMermaid(null);
    setSummarizeError(null);
    setDiagramError(null);
    setShowSummaryPanel(false);
    setShowDiagramPanel(false);
    setSummaryMessageCount(0);
    setDiagramMessageCount(0);
    setSessionSources([]);
    setChatWithDocs(false);
    setSourcesOnlyMode(false);
    setRollingSummary(null);
    setRollingSummaryAt(null);
    setToolTraces([]);
    setIngestError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleTabSelect = (tab: TerminalTab) => {
    setActiveTab(tab);
    setShowSummaryPanel(false);
    setShowDiagramPanel(false);
    setShowTracePanel(false);
  };

  const handleExportChat = async (format: 'md' | 'txt') => {
    if (messages.length === 0 && !sessionId) return;

    const title = activeConversation
      ? getConversationDisplayTitle(activeConversation)
      : 'Transmission';

    let exportMessagesList = messages;
    if (sessionId) {
      try {
        const serverMessages = await fetchThreadMessages(sessionId);
        if (serverMessages.length > 0) exportMessagesList = serverMessages;
      } catch {
        /* use local transcript */
      }
    }

    if (exportMessagesList.length === 0) return;
    exportMessages(exportMessagesList, format, title);
  };

  const handleIngestFile = async (file: File) => {
    setIsIngesting(true);
    setIngestError(null);
    try {
      const extracted = await extractSingleFileTextForIngest(file);
      const sourceId = createMessageId();
      const result = await ingestDocument(sessionId, file.name, extracted, sourceId);
      if (result.sessionId) setSessionId(result.sessionId);
      setSessionSources((prev) => [
        ...prev,
        createFileSource(file.name, result.extractedText || extracted, result.summary, sourceId),
      ]);
    } catch {
      setIngestError('Document ingest failed — is neurosentia-serve running?');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleIngestFiles = async (files: File[]) => {
    for (const file of files) {
      await handleIngestFile(file);
    }
  };

  const handleIngestImages = async (files: File[], mode: ImageIngestMode) => {
    for (const file of files) {
      setIsIngesting(true);
      setIngestError(null);
      try {
        const sourceId = createMessageId();
        const result = await ingestImage(sessionId, file.name, file, mode, sourceId);
        if (result.sessionId) setSessionId(result.sessionId);
        setSessionSources((prev) => [
          ...prev,
          createImageSource(
            file.name,
            result.extractedText || result.summary,
            result.summary,
            sourceId,
          ),
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Image ingest failed';
        setIngestError(
          message.includes('Tesseract') || message.includes('tesseract')
            ? `${message} — install Tesseract OCR and set TESSERACT_CMD if needed.`
            : message || 'Image ingest failed — is neurosentia-ingest running with a vision model?',
        );
        break;
      } finally {
        setIsIngesting(false);
      }
    }
  };

  const handleIngestUrl = async (url: string) => {
    setIsIngesting(true);
    setIngestError(null);
    try {
      const sourceId = createMessageId();
      const result = await ingestUrl(sessionId, url, sourceId);
      if (result.sessionId) setSessionId(result.sessionId);
      setSessionSources((prev) => [
        ...prev,
        createUrlSource(
          url,
          result.title || url,
          result.extractedText || result.summary,
          result.summary,
          sourceId,
        ),
      ]);
    } catch {
      setIngestError('URL ingest failed — check the link and neurosentia-serve.');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSpeakMessage = (content: string) => {
    ttsStopRef.current?.();
    setTtsActive(true);
    const session = speakText(content, setVuLevel, () => {
      setTtsActive(false);
      setVuLevel(0);
      ttsStopRef.current = null;
    });
    ttsStopRef.current = session.stop;
  };

  const handleToggleChatWithDocs = (enabled: boolean) => {
    setChatWithDocs(enabled);
    if (!enabled) setSourcesOnlyMode(false);
  };

  const handleToggleSource = (id: string) => {
    setSessionSources((prev) => toggleSourceEnabled(prev, id));
  };

  const handleDeleteSource = async (id: string) => {
    if (!sessionId) {
      setIngestError('Cannot delete embeddings — start a chat session first.');
      return;
    }

    setDeletingSourceId(id);
    setIngestError(null);
    try {
      await deleteDocumentSource(sessionId, id);
      setSessionSources((prev) => removeSource(prev, id));
    } catch {
      setIngestError(
        'Delete failed — embeddings may still be in Qdrant. Is neurosentia-ingest running?',
      );
    } finally {
      setDeletingSourceId(null);
    }
  };

  const handlePinsChange = (pins: string[]) => {
    setMemoryPins(pins);
    saveMemoryPins(pins);
  };

  const handleSummarizeThread = async () => {
    if (!sessionId || isLoading || isSummarizing) return;

    setShowSummaryPanel(true);
    setShowDiagramPanel(false);
    setIsSummarizing(true);
    setSummarizeError(null);

    try {
      const result = await summarizeThread(sessionId);
      setThreadSummary(result.summary);
      setThreadMermaid(result.mermaid || null);
      setSummaryMessageCount(result.messageCount);
    } catch {
      setSummarizeError('Summarization failed — is neurosentia-serve running?');
    } finally {
      setIsSummarizing(false);
    }
  };

  const resumeConversation = async (conversation: ChatConversation) => {
    if (isLoading || isResuming || conversation.id === activeConversationId) return;
    persistSkipRef.current = true;
    setIsResuming(true);
    setMessages(conversation.messages);
    setSessionId(conversation.sessionId);
    const restoredSources =
      conversation.sessionSources?.length
        ? conversation.sessionSources
        : legacySourcesFromConversation(conversation.sessionDocument, conversation.sessionUrl);
    setSessionSources(restoredSources);
    setChatWithDocs(
      Boolean(conversation.chatWithDocs)
        || (Boolean(conversation.sourcesOnlyMode) && restoredSources.length > 0),
    );
    setSourcesOnlyMode(Boolean(conversation.sourcesOnlyMode));
    setRollingSummary(conversation.rollingSummary ?? null);
    setRollingSummaryAt(conversation.rollingSummaryAt ?? null);
    activeConversationIdRef.current = conversation.id;
    setActiveConversationId(conversation.id);
    setInput('');
    setAttachedFiles([]);
    setIsResuming(false);
    inputRef.current?.focus();
  };

  const removeRecording = (conversationId: string) => {
    if (isLoading) return;
    setConversations((prev) => removeConversation(prev, conversationId));
    if (renamingId === conversationId) setRenamingId(null);
    if (activeConversationIdRef.current !== conversationId) return;

    persistSkipRef.current = true;
    activeConversationIdRef.current = null;
    setActiveConversationId(null);
    setMessages([]);
    setSessionId(null);
    setInput('');
    setAttachedFiles([]);
    setEditingMessageId(null);
    setThreadSummary(null);
    setThreadMermaid(null);
    setSummarizeError(null);
    setDiagramError(null);
    setShowSummaryPanel(false);
    setShowDiagramPanel(false);
    setSummaryMessageCount(0);
    setDiagramMessageCount(0);
    setSessionSources([]);
    setChatWithDocs(false);
    setSourcesOnlyMode(false);
    setRollingSummary(null);
    setRollingSummaryAt(null);
    setToolTraces([]);
    setIngestError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleLocationBlur = () => {
    saveUserLocation(userLocation);
  };

  const handlePersonaChange = (mode: ChatPersonaMode) => {
    setPersonaMode(mode);
    savePersonaMode(mode);
  };

  const filteredConversations = React.useMemo(
    () =>
      filterConversations(conversations, {
        query: recordingQuery,
        fromDate: recordingFrom || undefined,
        toDate: recordingTo || undefined,
      }),
    [conversations, recordingFrom, recordingQuery, recordingTo],
  );

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  const hasError = messages.some((m) => m.error);
  const showWelcome = messages.length === 0 && !isLoading && !isResuming;
  const showLongThreadHint =
    messages.filter((m) => m.content.trim()).length >= LONG_THREAD_MESSAGE_COUNT
    && Boolean(sessionId)
    && !showSummaryPanel
    && !threadSummary
    && !isSummarizing;
  const summaryTitle = activeConversation
    ? getConversationDisplayTitle(activeConversation)
    : 'Transmission';
  const panelMessageCount = summaryMessageCount || messages.filter((m) => m.content.trim()).length;
  const diagramPanelMessageCount =
    diagramMessageCount || messages.filter((m) => m.content.trim()).length;
  const statusText = hasError
    ? 'LOW SIGNAL'
    : isResuming
      ? 'LOADING TAPE...'
      : isSummarizing
        ? 'SUMMARIZING...'
        : isDiagramming
          ? 'DIAGRAMMING...'
      : isExtracting
        ? 'READING FILES...'
        : isLoading
          ? 'BUFFERING...'
          : isListening
            ? 'MIC LIVE'
            : 'SIGNAL OK';

  return (
    <Box className={`app-content-page turing-chat-page ${hasError ? 'turing-chat-page--error' : isLoading || isSummarizing || isDiagramming ? 'turing-chat-page--loading' : 'turing-chat-page--ready'}`}>
      <Box className="crt-agent-panel" component="aside" aria-label="Agent information">
        <Box className="crt-agent-plate">
          <span className="crt-agent-callsign">TD·047</span>
          <Box className="crt-agent-panel-title">AGENT INFO</Box>
        </Box>

        <Box className="crt-profile-row">
          <Box className="crt-photo-wrap">
            <img src={logoIcon} alt="" className="crt-photo" />
          </Box>
          <Box className="crt-fields">
            <Box className="crt-field">
              <span className="crt-field-label">AGENT:</span> TD-47-AI
            </Box>
            <Box className="crt-field">
              <span className="crt-field-label">SESSION:</span> {formatThreadId(sessionId)}
            </Box>
            <Box className="crt-field">
              <span className="crt-field-label">MODE:</span>
              <span className="crt-mode-toggle">
                <button
                  type="button"
                  className={`crt-mode-btn${personaMode === 'brief' ? ' crt-mode-btn--active' : ''}`}
                  onClick={() => handlePersonaChange('brief')}
                  disabled={isLoading}
                >
                  BRIEF
                </button>
                <button
                  type="button"
                  className={`crt-mode-btn${personaMode === 'architect' ? ' crt-mode-btn--active' : ''}`}
                  onClick={() => handlePersonaChange('architect')}
                  disabled={isLoading}
                >
                  ARCHITECT
                </button>
              </span>
            </Box>
          </Box>
        </Box>

        <Box className="crt-pref-block">
          <label className="crt-pref-label" htmlFor="crt-location">
            <FaMapMarkerAlt aria-hidden="true" /> LOC
          </label>
          <input
            id="crt-location"
            className="crt-pref-input"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
            onBlur={handleLocationBlur}
            placeholder="e.g. Pune, Maharashtra"
            disabled={isLoading}
          />
        </Box>

        <Box className="crt-bio">{AGENT_BIO}</Box>
      </Box>

      <Box className="crt-cabinet">
        <Box className="crt-terminal">
          <Box className="crt-scanlines" aria-hidden="true" />
          <Box className="crt-bezel">
            <Box className="crt-frame">
              <Box className="crt-top-bar">
                <Box className="crt-model-plate">
                  <span className="crt-model-name">TURING&apos;S DREAM</span>
                  <span className="crt-version">NSYS TRANSMITTER · PLC 2.4</span>
                </Box>
                <Box className="crt-top-readouts">
                  <span className="crt-clock-readout">{formatTransmitterClock(clock)}</span>
                  <button type="button" className="crt-clear-btn" onClick={startNewThread}>
                    CLR SESSION
                  </button>
                </Box>
              </Box>

              <Box className="crt-tabs" role="tablist" aria-label="Terminal sections">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={tab === activeTab}
                    className={`crt-tab${tab === activeTab && !showSummaryPanel && !showDiagramPanel ? ' crt-tab--active' : ''}`}
                    onClick={() => handleTabSelect(tab)}
                  >
                    {tab}
                  </button>
                ))}
                <span className="crt-tab-divider" aria-hidden="true" />
                <button
                  type="button"
                  className="crt-tab crt-tab--action"
                  disabled={messages.length === 0 && !sessionId}
                  onClick={() => void handleExportChat('md')}
                >
                  EXPORT
                </button>
                <button
                  type="button"
                  className={`crt-tab crt-tab--action${showSummaryPanel ? ' crt-tab--active' : ''}${isSummarizing ? ' crt-tab--action-live' : ''}`}
                  disabled={!sessionId || isLoading || isSummarizing || isDiagramming}
                  onClick={() => void handleSummarizeThread()}
                >
                  {isSummarizing ? 'SUMMARIZING…' : 'SUMMARIZE'}
                </button>
                <button
                  type="button"
                  className={`crt-tab crt-tab--action${showDiagramPanel ? ' crt-tab--active' : ''}${isDiagramming ? ' crt-tab--action-live' : ''}`}
                  disabled={!sessionId || isLoading || isSummarizing || isDiagramming}
                  onClick={() => void handleDiagramThread()}
                >
                  {isDiagramming ? 'DIAGRAMMING…' : 'DIAGRAM'}
                </button>
                <button
                  type="button"
                  className={`crt-tab crt-tab--action${showTracePanel ? ' crt-tab--active' : ''}`}
                  disabled={!sessionId}
                  onClick={() => {
                    setShowTracePanel((v) => !v);
                    setShowSummaryPanel(false);
                    setShowDiagramPanel(false);
                    if (sessionId) {
                      void fetchToolTraces(sessionId).then(setToolTraces);
                    }
                  }}
                >
                  TRACE
                </button>
              </Box>

              <Box className="crt-body">
                <Box className="crt-panel crt-sidebar" component="aside">
                  <Box className="crt-sidebar-header">
                    <Box className="crt-sidebar-title">RECORDINGS</Box>
                    <button
                      type="button"
                      className="crt-history-new-btn"
                      onClick={startNewThread}
                      disabled={isLoading || isResuming}
                    >
                      + NEW
                    </button>
                  </Box>

                  <Box className="crt-recording-search">
                    <input
                      className="crt-recording-search-input"
                      value={recordingQuery}
                      onChange={(e) => setRecordingQuery(e.target.value)}
                      placeholder="SEARCH..."
                      aria-label="Search recordings"
                    />
                    <Box className="crt-recording-dates">
                      <input
                        type="date"
                        className="crt-recording-date"
                        value={recordingFrom}
                        onChange={(e) => setRecordingFrom(e.target.value)}
                        aria-label="From date"
                      />
                      <input
                        type="date"
                        className="crt-recording-date"
                        value={recordingTo}
                        onChange={(e) => setRecordingTo(e.target.value)}
                        aria-label="To date"
                      />
                    </Box>
                  </Box>

                  {activeConversation && (
                    <Box className="crt-recording-actions">
                      <button
                        type="button"
                        className="crt-recording-action-btn"
                        onClick={() => exportConversation(activeConversation, 'md')}
                      >
                        <FaDownload /> MD
                      </button>
                      <button
                        type="button"
                        className="crt-recording-action-btn"
                        onClick={() => exportConversation(activeConversation, 'txt')}
                      >
                        <FaDownload /> TXT
                      </button>
                    </Box>
                  )}

                  <Box className="crt-history-list" role="list">
                    {filteredConversations.length === 0 ? (
                      <Box className="crt-history-empty">NO MATCHING RECORDINGS.</Box>
                    ) : (
                      filteredConversations.map((conversation) => {
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
                                onChange={(e) => setRenameDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setConversations((prev) =>
                                      renameConversation(prev, conversation.id, renameDraft),
                                    );
                                    setRenamingId(null);
                                  }
                                  if (e.key === 'Escape') setRenamingId(null);
                                }}
                                autoFocus
                              />
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="crt-history-item-main"
                                  onClick={() => void resumeConversation(conversation)}
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
                                      setConversations((prev) =>
                                        togglePinConversation(prev, conversation.id),
                                      );
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
                                      setRenamingId(conversation.id);
                                      setRenameDraft(displayTitle);
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
                                      exportConversation(conversation, 'md');
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
                                      removeRecording(conversation.id);
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

                <Box className="crt-main">
                  <Box className="crt-channel-strip">
                    <span className="crt-channel-label">
                      {showSummaryPanel
                        ? '▸ THREAD SUMMARY'
                        : showDiagramPanel
                          ? '▸ LINE DIAGRAM'
                        : showTracePanel
                          ? '▸ TOOL TRACE'
                          : activeTab === 'DOCUMENTS'
                            ? '▸ DOCUMENT CHANNEL'
                            : activeTab === 'LOC'
                              ? '▸ MEMORY PINS'
                              : activeTab === 'MAP'
                                ? '▸ CONTEXT MAP'
                                : '▸ LIVE CHANNEL'}
                    </span>
                    <span className="crt-channel-mode">
                      {userLocation ? `LOC: ${userLocation.toUpperCase()}` : 'NO LOC SET'}
                      {' · '}
                      {personaMode === 'architect' ? 'ARCHITECT MODE' : 'BRIEF MODE'}
                      {effectiveSourcesOnly && ' · SOURCES ONLY'}
                      {chatWithDocs
                        && hasEnabledSources(chatSessionSources)
                        && ` · ${chatSessionSources.filter((s) => s.enabled).length} DOC(S)`}
                    </span>
                    <AudioChannel active={ttsActive} level={vuLevel} />
                  </Box>

                  {showSummaryPanel ? (
                    <ThreadSummaryPanel
                      summary={threadSummary}
                      mermaid={threadMermaid}
                      isSummarizing={isSummarizing}
                      error={summarizeError}
                      sessionId={sessionId}
                      title={summaryTitle}
                      messageCount={panelMessageCount}
                      onRefresh={() => void handleSummarizeThread()}
                    />
                  ) : showDiagramPanel ? (
                    <ThreadDiagramPanel
                      mermaid={threadMermaid}
                      isDiagramming={isDiagramming}
                      error={diagramError}
                      sessionId={sessionId}
                      title={summaryTitle}
                      messageCount={diagramPanelMessageCount}
                      onRefresh={() => void handleDiagramThread()}
                    />
                  ) : showTracePanel ? (
                    <ToolTracePanel traces={toolTraces} />
                  ) : activeTab === 'MAP' ? (
                    <Box className="crt-map-stack">
                      <ThreadContextMap
                        messages={messages}
                        sessionId={sessionId}
                        userLocation={userLocation}
                        personaMode={personaMode}
                      />
                      <TimelineRail messages={messages} />
                      <EntityHeatMap messages={messages} />
                    </Box>
                  ) : activeTab === 'DOCUMENTS' ? (
                    <DocumentSessionPanel
                      sources={sessionSources}
                      isIngesting={isIngesting}
                      deletingSourceId={deletingSourceId}
                      ingestError={ingestError}
                      onPickFiles={(files) => void handleIngestFiles(files)}
                      onPickImages={(files, mode) => void handleIngestImages(files, mode)}
                      onIngestUrl={(url) => void handleIngestUrl(url)}
                      onDeleteSource={(id) => void handleDeleteSource(id)}
                    />
                  ) : activeTab === 'LOC' ? (
                    <MemoryPinsPanel pins={memoryPins} onChange={handlePinsChange} />
                  ) : activeTab === 'CHAT' ? (
                    <>
                  <ChatDocsPanel
                    sources={sessionSources}
                    chatWithDocs={chatWithDocs}
                    sourcesOnlyMode={sourcesOnlyMode}
                    onToggleChatWithDocs={handleToggleChatWithDocs}
                    onToggleSourcesOnly={setSourcesOnlyMode}
                    onToggleSource={handleToggleSource}
                  />
                  {ingestError && chatWithDocs && (
                    <Box className="crt-doc-error crt-chat-docs-error">{ingestError}</Box>
                  )}
                  <Box className="crt-panel crt-chat-panel">
                    <Box className="crt-messages" role="log" aria-live="polite">
                      {showWelcome && (
                        <Box className="crt-line crt-line--system">
                          <p className="crt-line-body">
                            <span className="crt-line-prompt" aria-hidden="true">&gt;</span>
                            <span className="crt-speaker">SYSTEM</span>
                            <span className="crt-text">CHANNEL OPEN. SELECT A QUERY LINE OR ENTER TRANSMISSION BELOW.</span>
                          </p>
                        </Box>
                      )}

                      {messages
                        .filter((message, index, arr) => {
                          if (message.role === 'user') return true;
                          if (message.content.length > 0) return true;
                          return isLoading && index === arr.length - 1;
                        })
                        .map((message) => {
                          const isStreamingMessage =
                            isLoading &&
                            message.role === 'assistant' &&
                            message.id === messages[messages.length - 1]?.id;
                          const mermaidBlocks =
                            message.role === 'assistant' ? extractMermaidBlocks(message.content) : [];
                          const displayText =
                            mermaidBlocks.length > 0
                              ? stripMermaidFences(message.content)
                              : message.content;

                          return (
                          <Box
                            key={message.id}
                            className={`crt-line crt-line--${message.role}${message.error ? ' crt-line--error' : ''}${isStreamingMessage ? ' crt-line--pending' : ''}`}
                          >
                            {editingMessageId === message.id ? (
                              <Box className="crt-edit-row">
                                <textarea
                                  className="crt-edit-input"
                                  value={editDraft}
                                  onChange={(e) => setEditDraft(e.target.value)}
                                  rows={3}
                                />
                                <Box className="crt-edit-actions">
                                  <button type="button" className="crt-edit-btn" onClick={() => void submitEditMessage()}>
                                    RESEND
                                  </button>
                                  <button
                                    type="button"
                                    className="crt-edit-btn crt-edit-btn--ghost"
                                    onClick={() => setEditingMessageId(null)}
                                  >
                                    CANCEL
                                  </button>
                                </Box>
                              </Box>
                            ) : (
                              <>
                                <Box className="crt-line-main">
                                  <p className="crt-line-body">
                                    <span className="crt-line-prompt" aria-hidden="true">&gt;</span>
                                    <span className="crt-speaker">{speakerLabel(message.role)}</span>
                                    <span className="crt-msg-time">{formatMessageTimestamp(message.timestamp)}</span>
                                    <span className="crt-text">
                                      {displayText}
                                      {isStreamingMessage &&
                                        (message.content.length > 0 ? (
                                          <span className="crt-stream-cursor" aria-hidden="true">
                                            █
                                          </span>
                                        ) : (
                                          <span className="crt-typing" aria-label="Generating response">
                                            <span>█</span>
                                            <span>█</span>
                                            <span>█</span>
                                          </span>
                                        ))}
                                    </span>
                                  </p>
                                  {mermaidBlocks.map((chart, index) => (
                                    <MermaidDiagram
                                      key={`${message.id}-mermaid-${index}`}
                                      chart={chart}
                                      diagramId={`${message.id}-${index}`}
                                    />
                                  ))}
                                  {message.sources && message.sources.length > 0 && (
                                    <Box className="crt-sources" component="ul">
                                      {message.sources.map((source) => (
                                        <li key={source.url}>
                                          <a href={source.url} target="_blank" rel="noreferrer">
                                            {source.title}
                                          </a>
                                        </li>
                                      ))}
                                    </Box>
                                  )}
                                  {message.searchSignal && (
                                    <ConfidenceStrip signal={message.searchSignal} />
                                  )}
                                </Box>
                                {(message.role === 'assistant' || message.role === 'user') && !isStreamingMessage && (
                                <Box className="crt-msg-actions crt-action-tray">
                                  {message.role === 'assistant' && (
                                    <>
                                      <Tooltip title={copiedId === message.id ? 'COPIED' : 'COPY'}>
                                        <button type="button" className="crt-copy-btn" onClick={() => void copyMessage(message)}>
                                          <FaCopy />
                                        </button>
                                      </Tooltip>
                                      <Tooltip title="READ ALOUD">
                                        <button
                                          type="button"
                                          className="crt-copy-btn"
                                          disabled={!isTtsSupported() || isLoading}
                                          onClick={() => handleSpeakMessage(message.content)}
                                        >
                                          <FaVolumeUp />
                                        </button>
                                      </Tooltip>
                                      <Tooltip title="REGENERATE">
                                        <button
                                          type="button"
                                          className="crt-copy-btn"
                                          disabled={isLoading}
                                          onClick={() => {
                                            const idx = messages.findIndex((m) => m.id === message.id);
                                            for (let i = idx - 1; i >= 0; i -= 1) {
                                              if (messages[i].role === 'user') {
                                                regenerateFrom(messages[i].content);
                                                break;
                                              }
                                            }
                                          }}
                                        >
                                          <FaRedo />
                                        </button>
                                      </Tooltip>
                                    </>
                                  )}
                                  {message.role === 'user' && (
                                    <>
                                      <Tooltip title={copiedId === message.id ? 'COPIED' : 'COPY'}>
                                        <button type="button" className="crt-copy-btn" onClick={() => void copyMessage(message)}>
                                          <FaCopy />
                                        </button>
                                      </Tooltip>
                                      <Tooltip title="EDIT & RESEND">
                                        <button type="button" className="crt-copy-btn" onClick={() => startEditMessage(message)}>
                                          <FaEdit />
                                        </button>
                                      </Tooltip>
                                    </>
                                  )}
                                </Box>
                                )}
                              </>
                            )}
                          </Box>
                          );
                        })}

                      <div ref={scrollAnchorRef} />
                    </Box>
                  </Box>

                  {showWelcome && (
                    <Box className="crt-prompts">
                      <Box className="crt-prompts-header">
                        <span>TEMPLATE TRANSMISSIONS</span>
                        <button
                          type="button"
                          className="crt-recording-action-btn"
                          onClick={() => {
                            if (editingTemplates) {
                              saveTransmissionTemplates(templateDrafts);
                              setTransmissionTemplates(loadTransmissionTemplates());
                              setEditingTemplates(false);
                            } else {
                              setTemplateDrafts([...transmissionTemplates]);
                              setEditingTemplates(true);
                            }
                          }}
                        >
                          {editingTemplates ? 'SAVE LINES' : 'EDIT LINES'}
                        </button>
                      </Box>
                      {(editingTemplates ? templateDrafts : transmissionTemplates).map((prompt, index) => (
                        editingTemplates ? (
                          <input
                            key={`draft-${index}`}
                            className="crt-template-input"
                            value={prompt}
                            onChange={(e) => {
                              const next = [...templateDrafts];
                              next[index] = e.target.value;
                              setTemplateDrafts(next);
                            }}
                          />
                        ) : (
                        <button
                          key={prompt}
                          type="button"
                          className="crt-prompt-line"
                          onClick={() => void sendMessage(prompt)}
                          disabled={
                            isLoading
                            || (effectiveSourcesOnly && !hasEnabledSources(chatSessionSources))
                          }
                        >
                          <span className="crt-prompt-num">L{index + 1}</span>
                          {prompt.toUpperCase()}
                        </button>
                        )
                      ))}
                    </Box>
                  )}

                  {hasError && (
                    <Box className="crt-error-bar">
                      <span>TRANSMISSION FAILED — CARRIER LOST.</span>
                      <button type="button" className="crt-retry-btn" onClick={retryLast}>
                        <FaRedo /> RETRY
                      </button>
                    </Box>
                  )}

                  {showLongThreadHint && (
                    <Box className="crt-summarize-hint">
                      <span>LONG THREAD — SERVER SUMMARY RECOMMENDED.</span>
                      <button
                        type="button"
                        className="crt-summarize-hint-btn"
                        disabled={isSummarizing}
                        onClick={() => void handleSummarizeThread()}
                      >
                        SUMMARIZE
                      </button>
                    </Box>
                  )}

                  {voiceError && <Box className="crt-voice-error">{voiceError}</Box>}

                  <Box className="crt-input-row" component="form" onSubmit={handleSubmit}>
                    <Box className="crt-panel crt-input-panel">
                      <textarea
                        ref={inputRef}
                        className="crt-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ENTER TRANSMISSION...  // NOTE: lines stay in export only"
                        rows={2}
                        disabled={isLoading}
                      />
                    </Box>
                    <Box className="crt-input-side">
                      <Tooltip title="Voice input">
                        <button
                          type="button"
                          className={`crt-attach-btn${isListening ? ' crt-mic-btn--live' : ''}`}
                          onClick={toggleVoice}
                          disabled={isLoading}
                          aria-label="Voice input"
                        >
                          <FaMicrophone />
                          <span>MIC IN</span>
                        </button>
                      </Tooltip>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="crt-file-input"
                        accept={ACCEPTED_FILE_TYPES}
                        multiple
                        onChange={handleFileSelect}
                        disabled={isLoading}
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                      <Tooltip title="Attach files">
                        <button
                          type="button"
                          className="crt-attach-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                        >
                          <FaPaperclip /><span>ATTACH</span>
                        </button>
                      </Tooltip>
                      {isLoading ? (
                        <button type="button" className="crt-stop-btn" onClick={stopGeneration}>
                          <FaStop /><span>HALT</span>
                        </button>
                      ) : (
                        <button type="submit" className="crt-send-btn" disabled={!canTransmit}>
                          <span className="crt-send-btn-face">XMIT</span>
                        </button>
                      )}
                    </Box>
                  </Box>

                  {attachedFiles.length > 0 && (
                    <Box className="crt-attachments">
                      {attachedFiles.map((file, index) => (
                        <Box key={`${file.name}-${index}`} className="crt-attachment-chip">
                          <span className="crt-attachment-name">{file.name.toUpperCase()}</span>
                          <button type="button" className="crt-attachment-remove" onClick={() => removeAttachment(index)}>
                            <FaTimes />
                          </button>
                        </Box>
                      ))}
                    </Box>
                  )}
                    </>
                  ) : (
                    <Box className="crt-panel crt-section-placeholder">
                      <span className="crt-section-placeholder-label">{activeTab}</span>
                      <p>THIS TERMINAL SECTION IS NOT WIRED YET. USE CHAT OR MAP.</p>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box className="crt-footer" component="footer">
                <Box className="crt-footer-left">
                  <Box className="crt-signal-status" title={statusText}>
                    <span className="crt-signal-label-text">{statusText}</span>
                  </Box>
                </Box>
                <span className="crt-footer-owner">NEUROSENTIA SYSTEMS</span>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
