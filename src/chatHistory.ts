import type { ChatMessage, SessionDocument, SessionSource, SessionUrlBrief } from './chat/types';

export type StoredChatMessage = ChatMessage;

export type ChatConversation = {
  id: string;
  sessionId: string | null;
  title: string;
  customTitle?: string;
  pinned?: boolean;
  messages: StoredChatMessage[];
  updatedAt: number;
  createdAt: number;
  sessionDocument?: SessionDocument | null;
  sessionUrl?: SessionUrlBrief | null;
  sessionSources?: SessionSource[];
  chatWithDocs?: boolean;
  sourcesOnlyMode?: boolean;
  rollingSummary?: string | null;
  rollingSummaryAt?: number;
};

const STORAGE_KEY = 'ns-chat-history';
const MAX_CONVERSATIONS = 50;

export function createConversationId() {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function deriveConversationTitle(messages: StoredChatMessage[]) {
  const firstUser = messages.find((m) => m.role === 'user' && m.content.trim());
  if (!firstUser) return 'UNTITLED TRANSMISSION';
  const text = firstUser.content.trim().replace(/\s+/g, ' ');
  const withoutAttachments = text.split('\n[ATTACHMENT CONTENT]')[0]?.trim() ?? text;
  return withoutAttachments.length > 48
    ? `${withoutAttachments.slice(0, 48)}…`
    : withoutAttachments;
}

export function getConversationDisplayTitle(conversation: ChatConversation) {
  return conversation.customTitle?.trim() || conversation.title;
}

function sortConversations(conversations: ChatConversation[]) {
  return [...conversations].sort((a, b) => {
    const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinDiff !== 0) return pinDiff;
    return b.updatedAt - a.updatedAt;
  });
}

export function loadChatHistory(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatConversation[];
    if (!Array.isArray(parsed)) return [];

    const normalized = parsed
      .filter((c) => c && typeof c.id === 'string' && Array.isArray(c.messages))
      .map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({
          ...m,
          timestamp: m.timestamp ?? c.updatedAt ?? Date.now(),
        })),
      }));

    return sortConversations(normalized).slice(0, MAX_CONVERSATIONS);
  } catch {
    return [];
  }
}

export function saveChatHistory(conversations: ChatConversation[]) {
  const sorted = sortConversations(conversations).slice(0, MAX_CONVERSATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  return sorted;
}

export type ConversationMeta = Partial<
  Pick<
    ChatConversation,
    | 'sessionDocument'
    | 'sessionUrl'
    | 'sessionSources'
    | 'chatWithDocs'
    | 'sourcesOnlyMode'
    | 'rollingSummary'
    | 'rollingSummaryAt'
  >
>;

export function upsertConversation(
  conversations: ChatConversation[],
  activeId: string | null,
  messages: StoredChatMessage[],
  sessionId: string | null,
  meta: ConversationMeta = {},
): { conversations: ChatConversation[]; activeId: string } {
  const now = Date.now();
  const autoTitle = deriveConversationTitle(messages);

  if (activeId) {
    const next = conversations.map((c) =>
      c.id === activeId
        ? {
            ...c,
            messages,
            sessionId,
            title: c.customTitle ? c.title : autoTitle,
            updatedAt: now,
            ...meta,
          }
        : c,
    );
    return {
      conversations: saveChatHistory(next),
      activeId,
    };
  }

  const created: ChatConversation = {
    id: createConversationId(),
    sessionId,
    title: autoTitle,
    messages,
    updatedAt: now,
    createdAt: now,
    ...meta,
  };

  return {
    conversations: saveChatHistory([created, ...conversations]),
    activeId: created.id,
  };
}

export function renameConversation(
  conversations: ChatConversation[],
  conversationId: string,
  customTitle: string,
) {
  const trimmed = customTitle.trim();
  const next = conversations.map((c) =>
    c.id === conversationId
      ? {
          ...c,
          customTitle: trimmed || undefined,
          title: trimmed || deriveConversationTitle(c.messages),
          updatedAt: Date.now(),
        }
      : c,
  );
  return saveChatHistory(next);
}

export function togglePinConversation(conversations: ChatConversation[], conversationId: string) {
  const next = conversations.map((c) =>
    c.id === conversationId
      ? { ...c, pinned: !c.pinned, updatedAt: Date.now() }
      : c,
  );
  return saveChatHistory(next);
}

export function removeConversation(conversations: ChatConversation[], conversationId: string) {
  return saveChatHistory(conversations.filter((c) => c.id !== conversationId));
}

export type RecordingSearchOptions = {
  query?: string;
  fromDate?: string;
  toDate?: string;
};

export function filterConversations(
  conversations: ChatConversation[],
  options: RecordingSearchOptions,
): ChatConversation[] {
  const query = options.query?.trim().toLowerCase() ?? '';
  const fromMs = options.fromDate ? new Date(options.fromDate).getTime() : null;
  const toMs = options.toDate ? new Date(`${options.toDate}T23:59:59`).getTime() : null;

  return conversations.filter((conversation) => {
    if (fromMs !== null && conversation.updatedAt < fromMs) return false;
    if (toMs !== null && conversation.updatedAt > toMs) return false;
    if (!query) return true;

    const haystack = [
      getConversationDisplayTitle(conversation),
      conversation.sessionId ?? '',
      ...conversation.messages.map((m) => m.content),
    ]
      .join('\n')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function formatHistoryTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).toUpperCase();
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day} · ${time}`;
}

export function formatMessageTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatThreadId(sessionId: string | null) {
  if (!sessionId) return 'PENDING';
  return sessionId.replace(/-/g, '').slice(0, 12).toUpperCase();
}

export function persistActiveConversation(
  conversations: ChatConversation[],
  activeId: string | null,
  messages: StoredChatMessage[],
  sessionId: string | null,
) {
  if (messages.length === 0) return conversations;
  return upsertConversation(conversations, activeId, messages, sessionId).conversations;
}
