import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

const STEPS = [
  {
    id: 'cloud',
    label: '1 · Cloud only',
    title: 'Tokens live on someone else’s GPU',
    body: 'Before llama.cpp, most people ran LLMs by shipping prompts to a rented server. Easy — until the bill, the privacy policy, or the offline flight.',
    pain: 'Cost · Privacy · Dependence',
  },
  {
    id: 'wall',
    label: '2 · The wall',
    title: 'The model will not fit',
    body: 'A 7B model in FP16 needs ~14 GB just for weights. Training stacks (PyTorch + CUDA) assume datacenter hardware. Your 16 GB laptop is not that.',
    pain: '7B × 2 bytes ≈ 14 GB',
  },
  {
    id: 'need',
    label: '3 · The need',
    title: 'Inference wants out of the greenhouse',
    body: 'We needed a tiny native runtime: quantize weights, mmap a single file, hit SIMD on CPU, optionally peel layers onto a small GPU — and stay local.',
    pain: 'Everyday hardware',
  },
  {
    id: 'engine',
    label: '4 · llama.cpp',
    title: 'The engine that showed up',
    body: 'Gerganov’s C/C++ project (March 2023) made that bet real. Same idea later powers Ollama, LM Studio, and a thousand local chat UIs.',
    pain: 'GGUF + ggml + backends',
  },
];

/**
 * Why llama.cpp had to exist — clickable narrative.
 */
export default function LlamaCppNeedViz() {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];

  return (
    <Box className="lcpp-viz quant-story" aria-label="Why llama.cpp was needed">
      <Typography component="p" className="ds-viz__title">
        Why this project had to exist
      </Typography>
      <Typography component="p" className="ds-viz__sub">
        Click the beats — cost, fit, and local control are the plot.
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

      <div className="quant-story__card lcpp-need__card">
        <div className="quant-story__stat">
          <span className="quant-story__stat-value lcpp-need__pain">{step.pain}</span>
          <span className="quant-story__stat-label">focus</span>
        </div>
        <div className="quant-story__copy">
          <Typography component="p" className="quant-story__heading">
            {step.title}
          </Typography>
          <Typography component="p" className="ds-viz__hook">
            {step.body}
          </Typography>
        </div>
      </div>

      <div className="quant-story__nav">
        <button
          type="button"
          className="ds-viz__tab"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          ← Back
        </button>
        <button
          type="button"
          className="ds-viz__tab is-on"
          disabled={idx === STEPS.length - 1}
          onClick={() => setIdx((i) => Math.min(STEPS.length - 1, i + 1))}
        >
          Next →
        </button>
      </div>
    </Box>
  );
}
