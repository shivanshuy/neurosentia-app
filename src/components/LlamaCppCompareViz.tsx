import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type Stack = 'llamacpp' | 'ollama' | 'hf';

const STACKS: Record<
  Stack,
  { title: string; role: string; youGet: string[]; youDont: string[]; when: string }
> = {
  llamacpp: {
    title: 'llama.cpp',
    role: 'The inference engine',
    youGet: [
      'Direct control: flags, backends, -ngl, samplers, llama-server',
      'Prebuilt zips or compile from source',
      'Runs any GGUF you point at',
      'Closest to the metal for benchmarks & weird models',
    ],
    youDont: [
      'No polished model library UI by default',
      'You manage GGUF files yourself',
      'Steeper first hour than Ollama',
    ],
    when: 'You want knobs, scripts, servers, or the newest backend the day it lands.',
  },
  ollama: {
    title: 'Ollama / LM Studio',
    role: 'Product on top of the engine',
    youGet: [
      'One-click pull & chat (`ollama run llama3.2`)',
      'Model library, Modelfiles, local API',
      'Same GGUF / ggml-class engine under the floorboards',
      'Great for daily use and demos',
    ],
    youDont: [
      'Less visibility into every cmake flag',
      'New llama.cpp features arrive after the wrapper catches up',
      'Abstraction can hide why a model is slow',
    ],
    when: 'You want “it just works” local chat — and still benefit from llama.cpp’s math.',
  },
  hf: {
    title: 'Hugging Face + transformers',
    role: 'Where models are born & shared',
    youGet: [
      'Safetensors / PyTorch checkpoints, configs, tokenizers',
      'Train, fine-tune, eval in Python',
      'Also hosts community GGUF repos (ready to download)',
      'transformers / vLLM / TGI for server inference',
    ],
    youDont: [
      'Not the same as llama.cpp — different runtime',
      'Full-precision HF weights often too big for a laptop',
      'Need convert → GGUF (or grab a GGUF upload) for llama.cpp',
    ],
    when: 'Training, research, or grabbing weights — then convert or pick a GGUF for local run.',
  },
};

/**
 * Compare llama.cpp vs Ollama-class apps vs Hugging Face.
 */
export default function LlamaCppCompareViz() {
  const [stack, setStack] = useState<Stack>('llamacpp');
  const active = STACKS[stack];

  return (
    <Box className="lcpp-viz ds-viz" aria-label="llama.cpp vs Ollama vs Hugging Face">
      <Typography component="p" className="ds-viz__title">
        Three layers people confuse
      </Typography>
      <Typography component="p" className="ds-viz__sub">
        Engine · product · hub. They cooperate — they are not synonyms.
      </Typography>

      <div className="ds-viz__tabs" role="tablist">
        {(Object.keys(STACKS) as Stack[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`ds-viz__tab${stack === id ? ' is-on' : ''}`}
            aria-selected={stack === id}
            onClick={() => setStack(id)}
          >
            {STACKS[id].title}
          </button>
        ))}
      </div>

      <div className="ds-viz__panel">
        <Typography component="p" className="lcpp-compare__role">
          {active.role}
        </Typography>
        <Typography component="p" className="ds-viz__hook">
          {active.when}
        </Typography>
        <div className="lcpp-compare__cols">
          <div>
            <Typography component="p" className="ds-viz__label">
              You get
            </Typography>
            <ul className="ds-viz__list">
              {active.youGet.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <Typography component="p" className="ds-viz__label">
              Trade-offs
            </Typography>
            <ul className="ds-viz__list">
              {active.youDont.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Box>
  );
}
