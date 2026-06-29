import Box from '@mui/material/Box';
import { extractEntityHeat } from '../chat/entities';
import type { ChatMessage } from '../chat/types';

type EntityHeatMapProps = {
  messages: ChatMessage[];
};

export default function EntityHeatMap({ messages }: EntityHeatMapProps) {
  const entities = extractEntityHeat(messages);
  if (entities.length === 0) return null;

  const max = entities[0]?.count ?? 1;

  return (
    <Box className="crt-entity-heat">
      <span className="crt-entity-heat-label">▸ ENTITY HEAT</span>
      <ul className="crt-entity-heat-list">
        {entities.map((entity) => (
          <li key={entity.term} className="crt-entity-heat-item">
            <span className="crt-entity-term">{entity.term}</span>
            <Box className="crt-entity-bar-wrap">
              <Box
                className="crt-entity-bar"
                style={{ width: `${Math.max(12, (entity.count / max) * 100)}%` }}
              />
            </Box>
            <span className="crt-entity-count">{entity.count}</span>
          </li>
        ))}
      </ul>
    </Box>
  );
}
