import type { ChatPersonaMode } from './types';

const LOCATION_KEY = 'ns-chat-location';
const PERSONA_KEY = 'ns-chat-persona';

export function loadUserLocation(): string {
  try {
    return localStorage.getItem(LOCATION_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function saveUserLocation(city: string) {
  const trimmed = city.trim();
  if (trimmed) {
    localStorage.setItem(LOCATION_KEY, trimmed);
  } else {
    localStorage.removeItem(LOCATION_KEY);
  }
}

export function loadPersonaMode(): ChatPersonaMode {
  try {
    const value = localStorage.getItem(PERSONA_KEY);
    return value === 'architect' ? 'architect' : 'brief';
  } catch {
    return 'brief';
  }
}

export function savePersonaMode(mode: ChatPersonaMode) {
  localStorage.setItem(PERSONA_KEY, mode);
}
