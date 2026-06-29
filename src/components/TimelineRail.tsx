import Box from '@mui/material/Box';
import type { ChatMessage } from '../chat/types';

type TimelineRailProps = {
  messages: ChatMessage[];
};

export default function TimelineRail({ messages }: TimelineRailProps) {
  const items = messages.filter((m) => m.content.trim());
  if (items.length < 2) return null;

  const start = items[0].timestamp;
  const end = items[items.length - 1].timestamp;
  const span = Math.max(end - start, 1);

  return (
    <Box className="crt-timeline-rail" aria-label="Message timeline">
      <span className="crt-timeline-label">▸ TIMELINE</span>
      <Box className="crt-timeline-track">
        {items.map((message, index) => {
          const left = ((message.timestamp - start) / span) * 100;
          return (
            <span
              key={message.id}
              className={`crt-timeline-dot crt-timeline-dot--${message.role}`}
              style={{ left: `${left}%` }}
              title={`#${index + 1} · ${message.role} · ${new Date(message.timestamp).toLocaleTimeString()}`}
            />
          );
        })}
      </Box>
      <Box className="crt-timeline-axis">
        <span>{new Date(start).toLocaleTimeString()}</span>
        <span>{items.length} MSG</span>
        <span>{new Date(end).toLocaleTimeString()}</span>
      </Box>
    </Box>
  );
}
