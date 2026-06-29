export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(
  text: string,
  onPulse?: (level: number) => void,
  onComplete?: () => void,
): { stop: () => void } {
  if (!isTtsSupported()) {
    return { stop: () => undefined };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 4000));
  utterance.rate = 1;
  utterance.pitch = 0.95;

  let raf = 0;
  let running = true;

  const pulse = () => {
    if (!running) return;
    onPulse?.(0.35 + Math.random() * 0.55);
    raf = window.requestAnimationFrame(pulse);
  };

  utterance.onstart = () => {
    running = true;
    pulse();
  };

  const stop = () => {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    window.speechSynthesis.cancel();
    onPulse?.(0);
  };

  utterance.onend = () => {
    stop();
    onComplete?.();
  };
  utterance.onerror = () => {
    stop();
    onComplete?.();
  };

  window.speechSynthesis.speak(utterance);
  return { stop };
}
