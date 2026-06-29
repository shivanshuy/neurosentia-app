const STOP = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'your', 'have', 'about', 'what',
  'when', 'where', 'which', 'would', 'could', 'should', 'their', 'there', 'they', 'them',
  'you', 'are', 'was', 'were', 'been', 'being', 'into', 'than', 'then', 'also', 'just',
  'like', 'how', 'can', 'will', 'our', 'not', 'but', 'all', 'any', 'may', 'use', 'using',
]);

const TECH = /\b(?:postgres(?:ql)?|mysql|redis|kafka|kubernetes|docker|langgraph|ollama|rag|mermaid|react|typescript|python|api|aws|gcp|azure)\b/gi;
const CITY = /\b(?:pune|mumbai|delhi|bangalore|bengaluru|london|new york|san francisco)\b/gi;
const PRODUCT = /\b(?:neurosentia|chatterbug|turing(?:'s)? dream)\b/gi;

function bump(counts: Map<string, number>, token: string, weight = 1) {
  const key = token.toLowerCase();
  if (key.length < 3 || STOP.has(key)) return;
  counts.set(key, (counts.get(key) ?? 0) + weight);
}

function scan(pattern: RegExp, text: string, counts: Map<string, number>, weight: number) {
  const re = new RegExp(pattern.source, pattern.flags);
  let match = re.exec(text);
  while (match) {
    bump(counts, match[0], weight);
    match = re.exec(text);
  }
}

export type EntityHeat = { term: string; count: number };

export function extractEntityHeat(messages: { role: string; content: string }[]): EntityHeat[] {
  const counts = new Map<string, number>();

  for (const message of messages) {
    const text = message.content;
    scan(TECH, text, counts, 2);
    scan(CITY, text, counts, 2);
    scan(PRODUCT, text, counts, 3);

    for (const raw of text.split(/\W+/)) {
      if (/^[A-Z][a-z]{2,}$/.test(raw)) bump(counts, raw, 1);
    }
  }

  return [...counts.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}
