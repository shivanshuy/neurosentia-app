import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type Fmt = 'alpaca' | 'sharegpt' | 'chatml';

const FORMATS: Record<
  Fmt,
  { title: string; blurb: string; sample: string }
> = {
  alpaca: {
    title: 'Alpaca',
    blurb: 'Flat triples: instruction, optional input, output. Great for single-turn SFT and LoRA.',
    sample: `{
  "instruction": "Summarize the note",
  "input": "Ship Friday. Blockers: none.",
  "output": "Ship Friday; no blockers."
}`,
  },
  sharegpt: {
    title: 'ShareGPT',
    blurb: 'Conversations as turns: human / gpt (or similar). Natural for multi-turn chat fine-tunes.',
    sample: `{
  "conversations": [
    { "from": "human", "value": "Hi — reset my password?" },
    { "from": "gpt", "value": "Sure. Open Settings → Security…" }
  ]
}`,
  },
  chatml: {
    title: 'ChatML',
    blurb: 'Role messages (system / user / assistant / tool). Common when teaching function calling.',
    sample: `{
  "messages": [
    { "role": "system", "content": "You call tools as JSON." },
    { "role": "user", "content": "Weather in Pune?" },
    { "role": "assistant", "content": "{\\"name\\":\\"get_weather\\",...}" }
  ]
}`,
  },
};

/**
 * Flip between common instruction / chat dataset shapes.
 */
export default function DatasetFormatViz() {
  const [fmt, setFmt] = useState<Fmt>('alpaca');
  const active = FORMATS[fmt];

  return (
    <Box className="ds-viz" aria-label="Dataset format examples">
      <Typography component="p" className="ds-viz__title">
        Same idea, three shapes
      </Typography>
      <Typography component="p" className="ds-viz__sub">
        Trainers care about row schema. Pick one format and stay consistent — converters exist, but
        messy mixes waste fine-tunes.
      </Typography>

      <div className="ds-viz__tabs" role="tablist">
        {(Object.keys(FORMATS) as Fmt[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`ds-viz__tab${fmt === id ? ' is-on' : ''}`}
            aria-selected={fmt === id}
            onClick={() => setFmt(id)}
          >
            {FORMATS[id].title}
          </button>
        ))}
      </div>

      <div className="ds-viz__panel">
        <Typography component="p" className="ds-viz__hook">
          {active.blurb}
        </Typography>
        <pre className="ds-viz__code">{active.sample}</pre>
      </div>
    </Box>
  );
}
