type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceInputSupported(): boolean {
  return getSpeechRecognition() !== null;
}

export function listenOnce(
  onPartial: (text: string) => void,
  onError: (message: string) => void,
): { stop: () => void } {
  const Ctor = getSpeechRecognition();
  if (!Ctor) {
    onError('Speech recognition is not supported in this browser.');
    return { stop: () => undefined };
  }

  const recognition = new Ctor();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = document.documentElement.lang || 'en-US';

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let text = '';
    for (let i = 0; i < event.results.length; i += 1) {
      text += event.results[i][0].transcript;
    }
    onPartial(text.trim());
  };

  recognition.onerror = () => {
    onError('Voice capture failed.');
  };

  recognition.start();

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}
