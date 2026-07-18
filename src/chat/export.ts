import type { ChatConversation } from '../chatHistory';
import { getConversationDisplayTitle } from '../chatHistory';
import type { ChatMessage } from './types';

function formatMessageLine(message: ChatMessage): string {
  const who = message.role === 'user' ? 'YOU' : 'TURING';
  const time = new Date(message.timestamp).toLocaleString();
  let block = `## ${who} · ${time}\n\n${message.content}`;

  if (message.operatorNotes?.length) {
    block += '\n\n**Operator notes (not sent to model):**\n';
    for (const note of message.operatorNotes) {
      block += `- // NOTE: ${note}\n`;
    }
  }

  if (message.searchSignal) {
    block += `\n\n**Search signal:** ${message.searchSignal}`;
  }

  if (message.sources?.length) {
    block += '\n\n**Sources:**\n';
    for (const source of message.sources) {
      block += `- [${source.title}](${source.url})\n`;
    }
  }

  return block;
}

export function exportThreadMarkdown(
  messages: ChatMessage[],
  title = 'Transmission Log',
): string {
  const header = `# ${title}\n\nExported ${new Date().toLocaleString()}\n`;
  const body = messages
    .filter((m) => m.content.trim())
    .map((m) => formatMessageLine(m))
    .join('\n\n---\n\n');
  return `${header}\n${body}\n`;
}

export function exportThreadText(messages: ChatMessage[], title = 'Transmission Log'): string {
  const header = `${title}\nExported ${new Date().toLocaleString()}\n${'='.repeat(48)}\n`;
  const body = messages
    .filter((m) => m.content.trim())
    .map((m) => {
      const who = m.role === 'user' ? 'YOU' : 'TURING';
      const time = new Date(m.timestamp).toLocaleString();
      let block = `[${who} · ${time}]\n${m.content}`;
      if (m.sources?.length) {
        block += '\n\nSources:\n';
        for (const source of m.sources) {
          block += `- ${source.title}: ${source.url}\n`;
        }
      }
      return block;
    })
    .join(`\n${'-'.repeat(48)}\n`);
  return `${header}\n${body}\n`;
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportMessages(
  messages: ChatMessage[],
  format: 'md' | 'txt',
  title = 'Transmission Log',
) {
  const safeName = title.replace(/[^\w.-]+/g, '_').slice(0, 40) || 'transmission';

  if (format === 'md') {
    downloadTextFile(`${safeName}.md`, exportThreadMarkdown(messages, title), 'text/markdown');
  } else {
    downloadTextFile(`${safeName}.txt`, exportThreadText(messages, title), 'text/plain');
  }
}

export function exportConversation(
  conversation: ChatConversation,
  format: 'md' | 'txt',
) {
  const title = getConversationDisplayTitle(conversation);
  exportMessages(conversation.messages, format, title);
}

export function exportSummary(summary: string, title: string, format: 'md' | 'txt') {
  const safeName = `${title.replace(/[^\w.-]+/g, '_').slice(0, 36) || 'transmission'}_summary`;
  const exported = new Date().toLocaleString();

  if (format === 'md') {
    const content = `# ${title} — Summary\n\nExported ${exported}\n\n${summary}`;
    downloadTextFile(`${safeName}.md`, content, 'text/markdown');
    return;
  }

  const content = `${title} — Summary\nExported ${exported}\n${'='.repeat(48)}\n\n${summary}`;
  downloadTextFile(`${safeName}.txt`, content, 'text/plain');
}
