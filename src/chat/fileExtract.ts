const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'csv', 'json', 'xml', 'yaml', 'yml', 'html', 'htm', 'log', 'ts', 'tsx', 'js', 'py',
]);

const MAX_CHARS_PER_FILE = 24_000;
const MAX_TOTAL_CHARS = 48_000;

function extensionOf(file: File): string {
  const parts = file.name.split('.');
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? '') : '';
}

function trimExtracted(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (normalized.length <= MAX_CHARS_PER_FILE) return normalized;
  return `${normalized.slice(0, MAX_CHARS_PER_FILE)}\n\n[…truncated…]`;
}

async function extractTextFileFull(file: File): Promise<string> {
  return (await file.text()).replace(/\r\n/g, '\n').trim();
}

async function extractPdfTextFull(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    if (pageText.trim()) pages.push(pageText);
  }

  return pages.join('\n\n').trim();
}

/** Extract full file text for batched ingest (no char cap). */
export async function extractSingleFileTextForIngest(file: File): Promise<string> {
  const ext = extensionOf(file);

  if (ext === 'pdf') {
    return extractPdfTextFull(file);
  }

  if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith('text/')) {
    return extractTextFileFull(file);
  }

  throw new Error(`Unsupported file type for ingest: ${file.name}`);
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    if (pageText.trim()) pages.push(pageText);
  }

  return trimExtracted(pages.join('\n\n'));
}

async function extractTextFile(file: File): Promise<string> {
  return trimExtracted(await file.text());
}

export async function extractFilesText(files: File[]): Promise<string> {
  const blocks: string[] = [];
  let total = 0;

  for (const file of files) {
    const ext = extensionOf(file);
    let text = '';

    try {
      if (ext === 'pdf') {
        text = await extractPdfText(file);
      } else if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith('text/')) {
        text = await extractTextFile(file);
      } else {
        blocks.push(`[FILE: ${file.name} — unsupported type for text extraction]`);
        continue;
      }
    } catch {
      blocks.push(`[FILE: ${file.name} — could not extract text]`);
      continue;
    }

    if (!text.trim()) {
      blocks.push(`[FILE: ${file.name} — no readable text found]`);
      continue;
    }

    const block = `--- ${file.name} ---\n${text}`;
    if (total + block.length > MAX_TOTAL_CHARS) {
      const remaining = MAX_TOTAL_CHARS - total;
      if (remaining > 80) {
        blocks.push(`${block.slice(0, remaining)}\n[…total attachment budget reached…]`);
      }
      break;
    }

    blocks.push(block);
    total += block.length;
  }

  return blocks.join('\n\n');
}

export async function buildMessageWithAttachments(text: string, files: File[]): Promise<string> {
  const trimmed = text.trim();
  if (files.length === 0) return trimmed;

  const extracted = await extractFilesText(files);
  if (!extracted.trim()) {
    const names = files.map((f) => f.name).join(', ');
    const fallback = `[ATTACHED: ${names}]`;
    return trimmed ? `${trimmed}\n\n${fallback}` : fallback;
  }

  const attachmentBlock = `[ATTACHMENT CONTENT]\n${extracted}`;
  return trimmed ? `${trimmed}\n\n${attachmentBlock}` : attachmentBlock;
}
