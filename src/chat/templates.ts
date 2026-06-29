const KEY = 'ns-transmission-templates';

const DEFAULT_TEMPLATES = [
  'What can Neurosentia help me build?',
  'Explain RAG for a product team.',
  'How do I scope an AI chatbot in 4 weeks?',
  'What is the Ultimate Question?',
];

export function loadTransmissionTemplates(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...DEFAULT_TEMPLATES];
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_TEMPLATES];
    return parsed.map((t) => String(t).trim()).filter(Boolean).slice(0, 8);
  } catch {
    return [...DEFAULT_TEMPLATES];
  }
}

export function saveTransmissionTemplates(templates: string[]) {
  const cleaned = templates.map((t) => t.trim()).filter(Boolean).slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(cleaned.length ? cleaned : DEFAULT_TEMPLATES));
}

export function resetTransmissionTemplates() {
  localStorage.removeItem(KEY);
}
