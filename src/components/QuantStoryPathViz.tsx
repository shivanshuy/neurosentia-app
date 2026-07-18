import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

const STEPS = [
  {
    id: 'full',
    label: '1 · Full weights',
    title: 'The model that will not fit',
    body: 'FP16 / BF16 weights are accurate and huge. A 70B model needs on the order of 140 GB just for parameters — before KV cache.',
    stat: '~140 GB',
    statLabel: '70B @ FP16 (weights only)',
  },
  {
    id: 'quant',
    label: '2 · Quantize',
    title: 'Same brain, fewer bits',
    body: 'Map each weight to a small integer (or FP8), keep a scale nearby, and reconstruct on the fly. Architecture unchanged — only the storage recipe.',
    stat: 'INT4 / INT8 / FP8',
    statLabel: 'common serving recipes',
  },
  {
    id: 'pack',
    label: '3 · Pack (GGUF)',
    title: 'One file you can actually ship',
    body: 'GGUF wraps metadata + tokenizer hints + block-quantized tensors into a mmap-friendly artifact for llama.cpp / Ollama and friends.',
    stat: '1 file',
    statLabel: 'portable checkpoint',
  },
  {
    id: 'run',
    label: '4 · Run',
    title: 'Chat on modest hardware',
    body: 'Less VRAM, less bandwidth per weight. Quality depends on the recipe — measure tasks, not only perplexity.',
    stat: '↓ VRAM · ↑ fit',
    statLabel: 'why people bother',
  },
];

/**
 * Narrative path: full model → quantize → GGUF → run.
 */
export default function QuantStoryPathViz() {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];

  return (
    <Box className="quant-viz quant-story" aria-label="Quantization journey from full weights to local run">
      <Typography component="p" className="quant-viz__title">
        The journey in four beats
      </Typography>
      <Typography component="p" className="quant-viz__sub">
        Click through — this is the story the rest of the article unpacks.
      </Typography>

      <div className="quant-story__rail" role="tablist">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === idx}
            className={`quant-story__stop${i === idx ? ' is-on' : ''}${i < idx ? ' is-done' : ''}`}
            onClick={() => setIdx(i)}
          >
            <span className="quant-story__dot" />
            <span className="quant-story__stop-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="quant-story__card">
        <div className="quant-story__stat">
          <span className="quant-story__stat-value">{step.stat}</span>
          <span className="quant-story__stat-label">{step.statLabel}</span>
        </div>
        <div className="quant-story__copy">
          <Typography component="p" className="quant-story__heading">
            {step.title}
          </Typography>
          <Typography component="p" className="quant-viz__note">
            {step.body}
          </Typography>
        </div>
      </div>

      <div className="quant-story__nav">
        <button
          type="button"
          className="quant-viz__tab"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          ← Back
        </button>
        <button
          type="button"
          className="quant-viz__tab is-on"
          disabled={idx === STEPS.length - 1}
          onClick={() => setIdx((i) => Math.min(STEPS.length - 1, i + 1))}
        >
          Next →
        </button>
      </div>
    </Box>
  );
}
