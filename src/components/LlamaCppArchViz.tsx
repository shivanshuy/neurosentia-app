import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

const STAGES = [
  { id: 'gguf', label: 'GGUF', hint: 'mmap weights' },
  { id: 'tok', label: 'Tokenizer', hint: 'text → ids' },
  { id: 'graph', label: 'ggml graph', hint: 'attention · FFN' },
  { id: 'backend', label: 'Backend', hint: 'CPU / GPU' },
  { id: 'sample', label: 'Sample', hint: 'next token' },
  { id: 'kv', label: 'KV cache', hint: 'decode memory' },
];

/**
 * Animated architecture loop: GGUF → tokens → graph → backend → sample → KV.
 */
export default function LlamaCppArchViz() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % STAGES.length);
    }, 1400);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const stage = STAGES[active];

  return (
    <Box className="lcpp-viz lcpp-arch" aria-label="llama.cpp architecture loop">
      <Typography component="p" className="ds-viz__title">
        Architecture as a live loop
      </Typography>
      <Typography component="p" className="ds-viz__sub">
        llama.cpp is not a chatbot UI — it is this pipeline. Click a stage, or hit Play.
      </Typography>

      <div className="lcpp-arch__track" role="list">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="listitem"
            className={`lcpp-arch__node${i === active ? ' is-on' : ''}${i < active ? ' is-past' : ''}`}
            onClick={() => {
              setPlaying(false);
              setActive(i);
            }}
          >
            <span className="lcpp-arch__idx">{i + 1}</span>
            <span className="lcpp-arch__label">{s.label}</span>
            {i < STAGES.length - 1 && <span className="lcpp-arch__arrow" aria-hidden />}
          </button>
        ))}
      </div>

      <div className="lcpp-arch__panel">
        <Typography component="p" className="lcpp-arch__stage-title">
          {stage.label}
        </Typography>
        <Typography component="p" className="ds-viz__hook">
          {stage.hint}
          {active === 0 &&
            ' — one file: quantized tensors, architecture metadata, tokenizer, quant recipe.'}
          {active === 1 &&
            ' — BPE / SentencePiece IDs; chat templates wrap roles before the model sees them.'}
          {active === 2 &&
            ' — ggml builds a compute graph (mul_mat, norms, attention). llama.cpp maps model architecture onto that graph.'}
          {active === 3 &&
            ' — CPU SIMD (AVX/NEON), Metal, CUDA, Vulkan, HIP… hybrid -ngl splits layers across devices.'}
          {active === 4 &&
            ' — logits → greedy / temperature / top-p. Detokenize and stream text to the user.'}
          {active === 5 &&
            ' — store K/V from prior tokens so decode does not recompute the whole prompt every step. Loop back.'}
        </Typography>
      </div>

      <div className="quant-story__nav">
        <button type="button" className={`ds-viz__tab${playing ? ' is-on' : ''}`} onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="ds-viz__tab"
          onClick={() => {
            setPlaying(false);
            setActive((i) => (i + STAGES.length - 1) % STAGES.length);
          }}
        >
          ← Prev
        </button>
        <button
          type="button"
          className="ds-viz__tab"
          onClick={() => {
            setPlaying(false);
            setActive((i) => (i + 1) % STAGES.length);
          }}
        >
          Next →
        </button>
      </div>
    </Box>
  );
}
