import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type Mode = 'instruction' | 'chat' | 'prefer';

const MODES: Record<
  Mode,
  { title: string; when: string; sample: string; tip: string }
> = {
  instruction: {
    title: 'Instruction (single-turn)',
    when: 'One task, one answer — summarize, rewrite, classify, generate SQL. No back-and-forth yet.',
    sample: `{
  "instruction": "Rewrite in a calmer support tone",
  "input": "Your refund is delayed!!! Fix it NOW",
  "output": "Thanks for waiting — I can help with your refund status…"
}`,
    tip: 'Best starter format (Alpaca). Easy to write, review, and train with LoRA.',
  },
  chat: {
    title: 'Chat (multi-turn)',
    when: 'The model must use earlier turns — clarify, remember constraints, stay in character.',
    sample: `{
  "conversations": [
    { "from": "human", "value": "I need a refund for order 4412" },
    { "from": "gpt", "value": "I can help. Was it card or wallet?" },
    { "from": "human", "value": "Card — last4 1199" },
    { "from": "gpt", "value": "Thanks. Card refunds post in 5–7 days…" }
  ]
}`,
    tip: 'ShareGPT / messages format. Train so turn 3 still respects turn 1.',
  },
  prefer: {
    title: 'Preference (chosen / rejected)',
    when: 'After the model can answer: teach taste — safer, clearer, more on-brand replies.',
    sample: `{
  "prompt": "User is angry about a late refund",
  "chosen": "Empathetic + concrete next steps + no blame",
  "rejected": "Defensive, vague, or policy-dump only"
}`,
    tip: 'DPO/ORPO-style. Do this after solid SFT, not instead of it.',
  },
};

/**
 * Side-by-side mental model: instruction vs chat vs preference rows.
 */
export default function DatasetKindCompareViz() {
  const [mode, setMode] = useState<Mode>('instruction');
  const active = MODES[mode];

  return (
    <Box className="ds-viz" aria-label="Instruction vs chat vs preference datasets">
      <Typography component="p" className="ds-viz__title">
        Three row shapes you will actually write
      </Typography>
      <Typography component="p" className="ds-viz__sub">
        Same product goal can use different row shapes. Pick the shape that matches how users will
        talk to the model.
      </Typography>

      <div className="ds-viz__tabs" role="tablist">
        {(Object.keys(MODES) as Mode[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`ds-viz__tab${mode === id ? ' is-on' : ''}`}
            aria-selected={mode === id}
            onClick={() => setMode(id)}
          >
            {MODES[id].title}
          </button>
        ))}
      </div>

      <div className="ds-viz__panel">
        <Typography component="p" className="ds-viz__hook">
          {active.when}
        </Typography>
        <pre className="ds-viz__code">{active.sample}</pre>
        <Typography component="p" className="ds-viz__body" sx={{ mt: 1.5, mb: 0 }}>
          <strong>Practice tip:</strong> {active.tip}
        </Typography>
      </div>
    </Box>
  );
}
