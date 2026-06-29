import Box from '@mui/material/Box';
import type { ToolTrace } from '../chat/toolTrace';

type ToolTracePanelProps = {
  traces: ToolTrace[];
};

export default function ToolTracePanel({ traces }: ToolTracePanelProps) {
  if (traces.length === 0) {
    return (
      <Box className="crt-trace-panel">
        <span className="crt-trace-title">TOOL TRACE</span>
        <span className="crt-trace-empty">NO TOOL RUNS RECORDED ON THIS THREAD.</span>
      </Box>
    );
  }

  return (
    <Box className="crt-trace-panel">
      <span className="crt-trace-title">TOOL TRACE · FLIGHT RECORDER</span>
      <ul className="crt-trace-list">
        {traces.map((trace) => (
          <li key={trace.id} className="crt-trace-item">
            <span className="crt-trace-tool">{trace.tool}</span>
            <span className="crt-trace-query">Q: {trace.query}</span>
            {trace.latencyMs > 0 && (
              <span className="crt-trace-latency">{trace.latencyMs} MS</span>
            )}
            <span className="crt-trace-preview">{trace.preview}</span>
          </li>
        ))}
      </ul>
    </Box>
  );
}
