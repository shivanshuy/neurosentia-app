import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type ModelId = 'llama3' | 'mistral' | 'qwen' | 'generic';

const MODELS: Record<
  ModelId,
  { title: string; note: string; rendered: string }
> = {
  llama3: {
    title: 'Llama 3 / 3.1 style',
    note: 'Uses special header tokens. Your dataset turns must render through this template before loss — not raw JSON.',
    rendered: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are WidgetCo support. Be brief and kind.<|eot_id|>
<|start_header_id|>user<|end_header_id|>

Reset password for order 4412?<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>

Open Settings → Security → Reset link. It expires in 30 minutes.<|eot_id|>`,
  },
  mistral: {
    title: 'Mistral Instruct style',
    note: 'Classic [INST] … [/INST] wrapping. System often folded into the first user block depending on recipe.',
    rendered: `<s>[INST] You are WidgetCo support. Be brief and kind.

Reset password for order 4412? [/INST] Open Settings → Security → Reset link. It expires in 30 minutes.</s>`,
  },
  qwen: {
    title: 'Qwen ChatML-ish',
    note: 'Qwen family often uses ChatML-like <|im_start|> roles. Keep system / user / assistant consistent.',
    rendered: `<|im_start|>system
You are WidgetCo support. Be brief and kind.<|im_end|>
<|im_start|>user
Reset password for order 4412?<|im_end|>
<|im_start|>assistant
Open Settings → Security → Reset link. It expires in 30 minutes.<|im_end|>`,
  },
  generic: {
    title: 'Portable JSON (store this)',
    note: 'Author in JSON (ShareGPT/ChatML/Alpaca). At train time, apply the tokenizer chat_template for YOUR model.',
    rendered: `{
  "messages": [
    { "role": "system", "content": "You are WidgetCo support. Be brief and kind." },
    { "role": "user", "content": "Reset password for order 4412?" },
    { "role": "assistant", "content": "Open Settings → Security → Reset link. It expires in 30 minutes." }
  ]
}`,
  },
};

/**
 * Same conversation, different model chat templates.
 */
export default function DatasetModelTemplateViz() {
  const [id, setId] = useState<ModelId>('generic');
  const active = MODELS[id];

  return (
    <Box className="ds-viz" aria-label="Chat templates per model family">
      <Typography component="p" className="ds-viz__title">
        Same chat, different model clothing
      </Typography>
      <Typography component="p" className="ds-viz__sub">
        Write portable JSON. Train on the string your target model actually sees. Mixing templates
        is a common silent failure.
      </Typography>

      <div className="ds-viz__tabs" role="tablist">
        {(Object.keys(MODELS) as ModelId[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`ds-viz__tab${id === key ? ' is-on' : ''}`}
            aria-selected={id === key}
            onClick={() => setId(key)}
          >
            {MODELS[key].title}
          </button>
        ))}
      </div>

      <div className="ds-viz__panel">
        <Typography component="p" className="ds-viz__hook">
          {active.note}
        </Typography>
        <pre className="ds-viz__code">{active.rendered}</pre>
      </div>
    </Box>
  );
}
