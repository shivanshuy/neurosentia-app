export type ChatPersonaMode = 'brief' | 'architect';

export type SearchSignal = 'HIGH' | 'LOW' | 'UNVERIFIED';

export type SearchSource = {
  title: string;
  url: string;
};

export type SessionDocument = {
  name: string;
  text: string;
  summary: string;
};

export type SessionUrlBrief = {
  url: string;
  title: string;
  summary: string;
};

export type SessionSourceKind = 'file' | 'url' | 'image';

export type SessionSource = {
  id: string;
  kind: SessionSourceKind;
  name: string;
  url?: string;
  text: string;
  summary: string;
  enabled: boolean;
  ingestedAt: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  error?: boolean;
  cancelled?: boolean;
  sources?: SearchSource[];
  searchSignal?: SearchSignal;
  operatorNotes?: string[];
  toolLatencyMs?: number;
};

export type StreamCallbacks = {
  onToken: (content: string) => void;
  onSources?: (sources: SearchSource[]) => void;
};

export type StreamRunOptions = {
  signal?: AbortSignal;
  persona?: ChatPersonaMode;
  location?: string;
  memoryPins?: string[];
  sessionSources?: SessionSource[];
  sourcesOnlyMode?: boolean;
  rollingSummary?: string | null;
};

export type StreamRunResult = {
  sessionId: string;
  content: string;
  sources: SearchSource[];
  cancelled: boolean;
};

export type ThreadSummarizeResult = {
  summary: string;
  mermaid: string;
  messageCount: number;
};

export type ThreadDiagramResult = {
  mermaid: string;
  messageCount: number;
};

export type IngestResult = {
  title: string;
  summary: string;
  extractedText: string;
  chunkCount?: number;
};
