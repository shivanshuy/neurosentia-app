import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type Grain = 'tensor' | 'channel' | 'group';

const ROWS = 8;
const COLS = 12;
const GROUP = 4;

function cellScale(grain: Grain, r: number, c: number): number {
  if (grain === 'tensor') return 0.35;
  if (grain === 'channel') return 0.2 + (r / (ROWS - 1)) * 0.7;
  const g = Math.floor(c / GROUP);
  return 0.25 + ((g + r * 0.15) % 1) * 0.55;
}

const COPY: Record<Grain, { title: string; body: string }> = {
  tensor: {
    title: 'Per-tensor',
    body: 'One scale (and often one zero-point) for the whole matrix. Cheapest metadata; worst fit when a few huge outliers dominate the range.',
  },
  channel: {
    title: 'Per-channel',
    body: 'One scale per output channel (row here). Standard for INT8 weights: each filter gets its own range so quiet channels are not crushed by loud ones.',
  },
  group: {
    title: 'Per-group / block',
    body: 'One scale per small block along the channel (groups of 32/64/128 are common in GPTQ/AWQ/GGUF). More metadata, finer fit — usually required for good INT4.',
  },
};

/**
 * Visual: one weight matrix with scale regions for tensor / channel / group quantization.
 */
export default function QuantGranularityViz() {
  const [grain, setGrain] = useState<Grain>('group');

  return (
    <Box className="quant-viz" aria-label="Quantization granularity comparison">
      <Typography component="p" className="quant-viz__title">
        How fine is the measuring stick?
      </Typography>
      <Typography component="p" className="quant-viz__sub">
        Affine quantization maps floats to integers with a scale (and often a zero-point). The
        question is: one stick for the whole tensor, one per channel, or one per small group?
      </Typography>

      <div className="quant-viz__tabs" role="tablist">
        {(Object.keys(COPY) as Grain[]).map((g) => (
          <button
            key={g}
            type="button"
            className={`quant-viz__tab${grain === g ? ' is-on' : ''}`}
            aria-selected={grain === g}
            onClick={() => setGrain(g)}
          >
            {COPY[g].title}
          </button>
        ))}
      </div>

      <div className="quant-grain">
        <div
          className="quant-grain__grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          role="img"
          aria-label={`Weight matrix with ${COPY[grain].title} scales`}
        >
          {Array.from({ length: ROWS * COLS }, (_, idx) => {
            const r = Math.floor(idx / COLS);
            const c = idx % COLS;
            const s = cellScale(grain, r, c);
            const groupEdge = grain === 'group' && c % GROUP === 0 && c !== 0;
            return (
              <span
                key={idx}
                className={`quant-grain__cell${groupEdge ? ' is-group-edge' : ''}`}
                style={{ background: `rgba(10, 10, 10, ${0.12 + s * 0.75})` }}
                title={`row ${r}, col ${c}`}
              />
            );
          })}
        </div>
        <div className="quant-grain__legend">
          <Typography component="p" className="quant-viz__note">
            <strong>{COPY[grain].title}.</strong> {COPY[grain].body}
          </Typography>
          {grain === 'group' && (
            <Typography component="p" className="quant-viz__hint">
              Vertical lines mark group boundaries (size {GROUP} in this toy grid).
            </Typography>
          )}
        </div>
      </div>
    </Box>
  );
}
