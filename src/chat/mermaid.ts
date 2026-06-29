const MERMAID_FENCE_RE = /```mermaid\s*([\s\S]*?)```/gi;

export function extractMermaidBlocks(content: string): string[] {
  const blocks: string[] = [];
  let match = MERMAID_FENCE_RE.exec(content);
  while (match) {
    const block = match[1]?.trim();
    if (block) blocks.push(block);
    match = MERMAID_FENCE_RE.exec(content);
  }
  MERMAID_FENCE_RE.lastIndex = 0;
  return blocks;
}

export function stripMermaidFences(content: string): string {
  return content.replace(MERMAID_FENCE_RE, '').trim();
}

export function hasMermaidFence(content: string): boolean {
  MERMAID_FENCE_RE.lastIndex = 0;
  return MERMAID_FENCE_RE.test(content);
}
