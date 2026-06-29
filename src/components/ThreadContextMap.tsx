import Box from '@mui/material/Box';
import type { ChatMessage, ChatPersonaMode } from '../chat/types';
import {
  buildThreadMap,
  getMapChildren,
  type MapNode,
  type ThreadMap,
} from '../chat/threadMap';

type ThreadContextMapProps = {
  messages: ChatMessage[];
  sessionId: string | null;
  userLocation: string;
  personaMode: ChatPersonaMode;
};

const KIND_LABEL: Record<MapNode['kind'], string> = {
  session: 'SES',
  location: 'LOC',
  mode: 'MODE',
  query: 'YOU',
  reply: 'TURING',
  source: 'LINK',
  attachment: 'DOC',
  service: 'SVC',
};

function MapTreeBranch({
  map,
  node,
  edgeLabel,
  depth = 0,
  isLast = true,
}: {
  map: ThreadMap;
  node: MapNode;
  edgeLabel?: string;
  depth?: number;
  isLast?: boolean;
}) {
  const children = getMapChildren(map, node.id);
  const prefix = depth === 0 ? '' : isLast ? '└─' : '├─';

  return (
    <li className="crt-map-branch">
      <Box className="crt-map-node" data-kind={node.kind}>
        {depth > 0 && <span className="crt-map-tree-glyph" aria-hidden="true">{prefix}</span>}
        <span className="crt-map-node-kind">{KIND_LABEL[node.kind]}</span>
        {node.href ? (
          <a className="crt-map-node-label" href={node.href} target="_blank" rel="noreferrer">
            {node.label}
          </a>
        ) : (
          <span className="crt-map-node-label">{node.label}</span>
        )}
        {edgeLabel && <span className="crt-map-edge-label">{edgeLabel}</span>}
        {node.detail && <span className="crt-map-node-detail">{node.detail}</span>}
      </Box>
      {children.length > 0 && (
        <ul className="crt-map-children">
          {children.map(({ node: child, edge }, index) => (
            <MapTreeBranch
              key={child.id}
              map={map}
              node={child}
              edgeLabel={edge.label}
              depth={depth + 1}
              isLast={index === children.length - 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ThreadContextMap({
  messages,
  sessionId,
  userLocation,
  personaMode,
}: ThreadContextMapProps) {
  const map = buildThreadMap({ messages, sessionId, userLocation, personaMode });
  const sessionNode = map.nodes.find((node) => node.id === 'node-session');
  const serviceHub = map.nodes.find((node) => node.id === 'node-neurosentia');
  const exchangeCount = map.nodes.filter((node) => node.kind === 'query').length;
  const sourceCount = map.nodes.filter((node) => node.kind === 'source').length;

  return (
    <Box className="crt-panel crt-map-panel">
      <Box className="crt-map-header">
        <span className="crt-map-title">CONTEXT MAP</span>
        <span className="crt-map-stats">
          {exchangeCount} EXCH · {sourceCount} LINKS
        </span>
      </Box>

      {messages.length === 0 ? (
        <Box className="crt-map-empty">
          NO THREAD DATA YET. SEND A TRANSMISSION ON CHAT TO POPULATE THE MAP.
        </Box>
      ) : (
        <Box className="crt-map-section">
          <span className="crt-map-section-label">▸ CURRENT THREAD</span>
          {sessionNode && (
            <ul className="crt-map-tree" role="tree" aria-label="Thread context map">
              <MapTreeBranch map={map} node={sessionNode} />
            </ul>
          )}
        </Box>
      )}

      <Box className="crt-map-section crt-map-section--services">
        <span className="crt-map-section-label">▸ SERVICE COVERAGE</span>
        {serviceHub && (
          <ul className="crt-map-tree" role="tree" aria-label="Neurosentia service areas">
            <MapTreeBranch map={map} node={serviceHub} />
          </ul>
        )}
      </Box>

      <Box className="crt-map-legend">
        <span>YOU = your query</span>
        <span>TURING = reply</span>
        <span>LINK = opened / cited URL</span>
        <span>DOC = attachment</span>
      </Box>
    </Box>
  );
}
