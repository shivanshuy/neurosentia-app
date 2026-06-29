export type ToolTrace = {
  id: string;
  tool: string;
  query: string;
  latencyMs: number;
  at: number;
  preview: string;
};

type RawMessage = {
  type?: string;
  role?: string;
  content?: unknown;
  name?: string;
  tool_calls?: Array<{ name?: string; args?: Record<string, unknown> }>;
};

function kind(msg: RawMessage): string {
  return (msg.type ?? msg.role ?? '').toLowerCase();
}

function text(content: unknown): string {
  return typeof content === 'string' ? content : '';
}

export function parseToolTracesFromThreadState(
  state: unknown,
  latencyMs = 0,
): ToolTrace[] {
  if (!state || typeof state !== 'object') return [];

  const values = (state as { values?: { messages?: RawMessage[] } }).values;
  const messages = values?.messages ?? (state as { messages?: RawMessage[] }).messages;
  if (!Array.isArray(messages)) return [];

  const traces: ToolTrace[] = [];
  const pending = new Map<string, { query: string; at: number }>();

  for (const msg of messages) {
    const k = kind(msg);
    if (k === 'ai' || k === 'assistant') {
      for (const call of msg.tool_calls ?? []) {
        if (call.name === 'duckduckgo_search') {
          const query = String(call.args?.query ?? '').trim();
          pending.set('duckduckgo_search', { query, at: Date.now() });
        }
      }
    }

    if (k === 'tool' || k === 'toolmessage') {
      if (msg.name !== 'duckduckgo_search') continue;
      const body = text(msg.content);
      const meta = pending.get('duckduckgo_search');
      traces.push({
        id: `trace-${traces.length + 1}`,
        tool: 'duckduckgo_search',
        query: meta?.query || '(unknown query)',
        latencyMs: latencyMs || 0,
        at: meta?.at ?? Date.now(),
        preview: body.slice(0, 180),
      });
      pending.delete('duckduckgo_search');
    }
  }

  return traces;
}
