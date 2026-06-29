const NOTE_LINE = /^\s*\/\/\s*NOTE:\s*/i;

export type ParsedTransmission = {
  modelText: string;
  operatorNotes: string[];
};

export function parseOperatorNotes(raw: string): ParsedTransmission {
  const operatorNotes: string[] = [];
  const kept: string[] = [];

  for (const line of raw.split('\n')) {
    if (NOTE_LINE.test(line)) {
      operatorNotes.push(line.replace(NOTE_LINE, '').trim());
    } else {
      kept.push(line);
    }
  }

  return {
    modelText: kept.join('\n').trim(),
    operatorNotes,
  };
}

export function hasOperatorNotes(raw: string): boolean {
  return raw.split('\n').some((line) => NOTE_LINE.test(line));
}
