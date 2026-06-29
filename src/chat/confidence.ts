import type { SearchSignal } from './types';

const FALLBACK_MARKERS = [
  'Results may be partial or dated',
  'No results found',
  'search failed',
];

export function assessSearchSignal(
  sources: { url: string }[] | undefined,
  toolOutput?: string,
): SearchSignal | null {
  if (!sources?.length && !toolOutput?.trim()) return null;

  const output = toolOutput ?? '';
  const lowered = output.toLowerCase();

  if (sources?.length) {
    const hasFallback = FALLBACK_MARKERS.some((m) => lowered.includes(m.toLowerCase()));
    if (hasFallback || sources.length < 2) return 'LOW';
    return sources.length >= 3 ? 'HIGH' : 'LOW';
  }

  if (lowered.includes('no results')) return 'UNVERIFIED';
  return 'UNVERIFIED';
}

export function signalLabel(signal: SearchSignal): string {
  switch (signal) {
    case 'HIGH':
      return 'SIGNAL: HIGH';
    case 'LOW':
      return 'SIGNAL: LOW';
    default:
      return 'SIGNAL: UNVERIFIED';
  }
}
