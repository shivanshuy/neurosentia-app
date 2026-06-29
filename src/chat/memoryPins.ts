const KEY = 'ns-memory-pins';

export function loadMemoryPins(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => p.trim()).filter(Boolean).slice(0, 12);
  } catch {
    return [];
  }
}

export function saveMemoryPins(pins: string[]) {
  const cleaned = pins.map((p) => p.trim()).filter(Boolean).slice(0, 12);
  localStorage.setItem(KEY, JSON.stringify(cleaned));
}

export function formatPinsForContext(pins: string[]): string {
  return pins.map((p) => `- ${p}`).join('\n');
}
