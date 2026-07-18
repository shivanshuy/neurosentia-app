import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type Mode = 'fp16' | 'int8' | 'int4';

const MODES: Array<{
  id: Mode;
  label: string;
  bits: number;
  levels: number;
  blurb: string;
}> = [
  {
    id: 'fp16',
    label: 'FP16',
    bits: 16,
    levels: 65536,
    blurb: 'Full-ish precision for inference: ~2 bytes per weight. A 7B model ≈ 14 GB of weights alone.',
  },
  {
    id: 'int8',
    label: 'INT8',
    bits: 8,
    levels: 256,
    blurb: '256 representable steps after scaling. ~1 byte per weight → ~2× smaller than FP16, often near-lossless with good calibration.',
  },
  {
    id: 'int4',
    label: 'INT4',
    bits: 4,
    levels: 16,
    blurb: 'Only 16 steps after scaling. ~0.5 bytes per weight → ~4× smaller than FP16. Powerful, but outliers and sensitive layers need care.',
  },
];

/**
 * Shows how many distinct values fit in FP16 / INT8 / INT4 and the memory implication.
 */
export default function QuantBitWidthViz() {
  const [mode, setMode] = useState<Mode>('fp16');
  const active = MODES.find((m) => m.id === mode) ?? MODES[0];
  const params = 7e9;
  const bytes = (params * active.bits) / 8;
  const gb = bytes / 1e9;

  return (
    <Box className="quant-viz" aria-label="Bit-width comparison for LLM weights">
      <Typography component="p" className="quant-viz__title">
        Same 7B weights, fewer bits
      </Typography>
      <Typography component="p" className="quant-viz__sub">
        Quantization does not delete parameters — it stores each number with fewer bits, then
        rescales at compute time. Fewer bits → smaller files and less memory traffic; also fewer
        distinct values, so error can creep in.
      </Typography>

      <div className="quant-viz__tabs" role="tablist" aria-label="Precision">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`quant-viz__tab${mode === m.id ? ' is-on' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="quant-viz__panel">
        <div className="quant-viz__bits" aria-hidden>
          {Array.from({ length: active.bits }, (_, i) => (
            <span key={i} className="quant-viz__bit" />
          ))}
        </div>
        <dl className="quant-viz__stats">
          <div>
            <dt>Bits per weight</dt>
            <dd>{active.bits}</dd>
          </div>
          <div>
            <dt>Distinct levels (ideal)</dt>
            <dd>{active.levels.toLocaleString()}</dd>
          </div>
          <div>
            <dt>7B weights on disk (ballpark)</dt>
            <dd>~{gb.toFixed(1)} GB</dd>
          </div>
        </dl>
        <Typography component="p" className="quant-viz__note">
          {active.blurb}
        </Typography>
      </div>
    </Box>
  );
}
