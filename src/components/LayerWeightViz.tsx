import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useMemo, useState } from 'react';

type TrainMode = 'full' | 'lora' | 'qlora';

const LAYER_COUNT = 3;
const TOTAL_STEPS = 100;
/** Default LoRA / QLoRA targets — Hu et al. / common PEFT */
const LORA_TARGETS = new Set(['q', 'v']);
const ATTN = ['q', 'k', 'v', 'o'] as const;

const MODE_META: Record<
  TrainMode,
  { label: string; subtitle: string; legendTrain: string; legendFrozen: string }
> = {
  full: {
    label: 'Full SFT',
    subtitle:
      'Every q / k / v / o matrix updates with the training slider. Largest change, largest memory.',
    legendTrain: 'Updating weights — change as you step time',
    legendFrozen: '—',
  },
  lora: {
    label: 'LoRA',
    subtitle:
      'Only A/B on q and v change. Base W stays frozen (Hu et al., 2021 / common PEFT default).',
    legendTrain: 'LoRA A / B — change as you step time',
    legendFrozen: 'Frozen base W — pattern never moves',
  },
  qlora: {
    label: 'QLoRA',
    subtitle:
      'Same adapters as LoRA; frozen W is 4-bit NF4 (including under q/v). Dettmers et al., 2023.',
    legendTrain: 'LoRA A / B — change as you step time',
    legendFrozen: 'Frozen 4-bit W — pattern never moves',
  },
};

const QKVO_HELP: Record<
  (typeof ATTN)[number],
  { title: string; role: string; math: string; example: string }
> = {
  q: {
    title: 'Query',
    role: '“What am I looking for right now?”',
    math: 'q = x W_q — a linear map from the token’s hidden vector x into a “search” vector.',
    example:
      'Sentence: “Paris is the capital of ___.” At the blank, the query points toward country-like / France-like context, not random earlier words.',
  },
  k: {
    title: 'Key',
    role: '“Here is my label so others can find me.”',
    math: 'k = x W_k — each position advertises itself. Attention scores ≈ q · kᵀ (scaled).',
    example:
      'The token “Paris” gets a key that says “city / place.” When the blank’s query looks for a country answer, it scores high against related keys (and lower against “is” or “the”).',
  },
  v: {
    title: 'Value',
    role: '“If you attend to me, this is the content I contribute.”',
    math: 'v = x W_v — the payload mixed in after soft-max weights α_i: Σ α_i v_i.',
    example:
      'Once attention picks “Paris” and nearby facts, their values carry usable meaning (city, France, capital) into the blank’s new representation — not just the match score.',
  },
  o: {
    title: 'Output',
    role: '“Write the gathered info back into the model’s main stream.”',
    math: 'After multi-head attention, o = (concat heads) W_o so the result matches the residual width d.',
    example:
      'Like filing notes back into a shared notebook: attention gathered facts; W_o formats them so the next MLP / layer can keep working.',
  },
};

function hash01(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function adapterCell(layer: number, matrix: string, row: number, col: number, t: number): number {
  const base = hash01(layer * 97 + matrix.charCodeAt(0) * 13 + row * 7 + col * 3);
  const drift = hash01(layer * 41 + row * 17 + col * 29 + 5);
  const progress = Math.min(1, Math.max(0, t));
  const wave = 0.55 + 0.45 * Math.sin(progress * Math.PI * (1.2 + drift) + base * 6);
  return Math.min(1, progress * (0.25 + 0.75 * base) * wave);
}

function frozenCell(layer: number, matrix: string, row: number, col: number): number {
  return 0.22 + 0.55 * hash01(layer * 53 + matrix.charCodeAt(0) * 11 + row * 19 + col * 23);
}

function isTrainable(mode: TrainMode, matrix: string): boolean {
  if (mode === 'full') return true;
  return LORA_TARGETS.has(matrix);
}

type WeightGridProps = {
  layer: number;
  matrix: string;
  cols: number;
  rows: number;
  step: number;
  trainable: boolean;
  quantized?: boolean;
};

function WeightGrid({ layer, matrix, cols, rows, step, trainable, quantized }: WeightGridProps) {
  const t = step / TOTAL_STEPS;
  const cells = useMemo(() => {
    const out: number[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        out.push(
          trainable
            ? adapterCell(layer, matrix, r, c, t)
            : frozenCell(layer, matrix, r, c),
        );
      }
    }
    return out;
  }, [layer, matrix, cols, rows, t, trainable]);

  return (
    <div
      className={[
        'layer-weight-viz__grid',
        trainable ? 'layer-weight-viz__grid--lora' : 'layer-weight-viz__grid--frozen',
        quantized ? 'layer-weight-viz__grid--quant' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
      aria-hidden
    >
      {cells.map((value, i) => (
        <span
          key={i}
          className="layer-weight-viz__cell"
          style={
            trainable
              ? {
                  background: `color-mix(in srgb, var(--ns-accent) ${Math.round(18 + value * 82)}%, #f4f4f4)`,
                  boxShadow:
                    value > 0.55
                      ? `0 0 6px color-mix(in srgb, var(--ns-accent) ${Math.round(value * 50)}%, transparent)`
                      : undefined,
                }
              : {
                  background: quantized
                    ? `color-mix(in srgb, #7a8794 ${Math.round(value * 55)}%, #e4e8ec)`
                    : `color-mix(in srgb, #9a9a9a ${Math.round(value * 70)}%, #ececec)`,
                }
          }
        />
      ))}
    </div>
  );
}

function StackAnatomy({ mode }: { mode: TrainMode }) {
  const demoLayers = [2, 1, 0];

  const chipNote = (m: string) => {
    if (mode === 'full') return 'updates';
    if (LORA_TARGETS.has(m)) return '+ LoRA';
    return mode === 'qlora' ? '4-bit freeze' : 'frozen';
  };

  return (
    <Box className="layer-weight-viz__anatomy" aria-label="How layers and q k v o stack">
      <Typography component="p" className="layer-weight-viz__anatomy-title">
        How the stack is built
      </Typography>
      <Typography component="p" className="layer-weight-viz__anatomy-lead">
        Think of the model as a tall building. Each floor is one transformer layer. Tokens walk in at
        the ground floor (embeddings). Every floor runs the same recipe, then hands a richer vector
        upstairs. By the top floors, the vector is ready to predict the next word.
      </Typography>
      <Typography component="p" className="layer-weight-viz__anatomy-lead">
        On each floor, self-attention is a soft lookup. Math in one line: scores = softmax(q kᵀ / √d),
        then mix = scores · v. Intuition: q asks a question, k is each word’s filing label, v is the
        folder contents you copy if the label matches. W_q, W_k, W_v, W_o are just the four matrices
        that build those vectors from the incoming hidden state x.
      </Typography>

      <div className="layer-weight-viz__worked">
        <p className="layer-weight-viz__worked-title">Worked mini-example</p>
        <p className="layer-weight-viz__worked-prompt">
          Prompt so far: <code>The battery is low so the phone will ___</code>
        </p>
        <ol className="layer-weight-viz__worked-list">
          <li>
            <strong>q at “___”</strong> — after W_q, this position’s vector leans toward “what happens
            next when power is low?” (shut down / die / sleep), not toward “color” or “price.”
          </li>
          <li>
            <strong>k at “battery” / “low”</strong> — W_k tags those words as power / condition cues.
            Dot products q·k light up those positions more than “The” or “so.”
          </li>
          <li>
            <strong>v at those words</strong> — W_v carries meaning to blend in (energy, device state).
            Softmax turns scores into weights that sum to 1; the blank becomes a weighted average of
            those values.
          </li>
          <li>
            <strong>o</strong> — W_o projects that mix back to width d and adds it (via residual) so
            the MLP can sharpen “die” vs “shutdown” for the next-token head upstairs.
          </li>
        </ol>
      </div>

      <div className="layer-weight-viz__anatomy-grid">
        <div className="layer-weight-viz__tower">
          <span className="layer-weight-viz__tower-cap">Toward output / logits</span>
          {demoLayers.map((layer, index) => (
            <div
              key={layer}
              className={
                layer === 1
                  ? 'layer-weight-viz__tower-floor layer-weight-viz__tower-floor--focus'
                  : 'layer-weight-viz__tower-floor'
              }
            >
              <span className="layer-weight-viz__tower-label">{`Layer ${layer}`}</span>
              {layer === 1 ? (
                <div className="layer-weight-viz__qkvo-stack">
                  <div className="layer-weight-viz__qkvo-row layer-weight-viz__qkvo-row--o">
                    <strong>o</strong>
                    <span>{chipNote('o')}</span>
                  </div>
                  <div className="layer-weight-viz__qkvo-attn">
                    softmax(q kᵀ / √d) · v
                  </div>
                  <div className="layer-weight-viz__qkvo-triple">
                    {(['q', 'k', 'v'] as const).map((m) => (
                      <div
                        key={m}
                        className={
                          isTrainable(mode, m)
                            ? 'layer-weight-viz__qkvo-chip layer-weight-viz__qkvo-chip--lora'
                            : 'layer-weight-viz__qkvo-chip'
                        }
                      >
                        <strong>{m}</strong>
                        <span>{chipNote(m)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="layer-weight-viz__qkvo-row layer-weight-viz__qkvo-row--in">
                    hidden state x in
                  </div>
                </div>
              ) : (
                <div className="layer-weight-viz__tower-summary">
                  {index === 0
                    ? '… later blocks (same recipe) …'
                    : index === demoLayers.length - 1
                      ? 'near embeddings / input tokens'
                      : 'same q·k·v·o + MLP'}
                </div>
              )}
            </div>
          ))}
          <span className="layer-weight-viz__tower-cap">Token embeddings / input</span>
        </div>

        <ul className="layer-weight-viz__qkvo-defs">
          {ATTN.map((m) => (
            <li key={m}>
              <div className="layer-weight-viz__qkvo-defs-head">
                <strong>{m}</strong>
                <span className="layer-weight-viz__qkvo-defs-title">{QKVO_HELP[m].title}</span>
              </div>
              <p className="layer-weight-viz__qkvo-defs-role">{QKVO_HELP[m].role}</p>
              <p className="layer-weight-viz__qkvo-defs-math">{QKVO_HELP[m].math}</p>
              <p className="layer-weight-viz__qkvo-defs-example">
                <span>Example.</span> {QKVO_HELP[m].example}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Box>
  );
}

export default function LayerWeightViz() {
  const [mode, setMode] = useState<TrainMode>('lora');
  const [step, setStep] = useState(0);
  const t = step / TOTAL_STEPS;
  const meta = MODE_META[mode];

  const layers = useMemo(
    () => Array.from({ length: LAYER_COUNT }, (_, i) => i),
    [],
  );

  const bumpStep = (delta: number) => {
    setStep((prev) => Math.min(TOTAL_STEPS, Math.max(0, prev + delta)));
  };

  const statusLabel = () => {
    if (t < 0.02) return 'init';
    if (t > 0.95) return mode === 'full' ? 'fully updated' : 'adapted';
    return mode === 'full' ? 'updating all W' : 'updating A, B';
  };

  return (
    <Box className="layer-weight-viz" role="region" aria-label="Layer weight training visualization">
      <StackAnatomy mode={mode} />

      <Box className="layer-weight-viz__header">
        <div>
          <Typography component="p" className="layer-weight-viz__title">
            Compare methods through the stack
          </Typography>
          <Typography component="p" className="layer-weight-viz__subtitle">
            {meta.subtitle}
          </Typography>
        </div>
        <div className="layer-weight-viz__tabs" role="tablist" aria-label="Fine-tuning method">
          {(Object.keys(MODE_META) as TrainMode[]).map((key) => (
            <Button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              size="small"
              variant={mode === key ? 'contained' : 'outlined'}
              className={
                mode === key
                  ? 'layer-weight-viz__tab layer-weight-viz__tab--active'
                  : 'layer-weight-viz__tab'
              }
              onClick={() => setMode(key)}
            >
              {MODE_META[key].label}
            </Button>
          ))}
        </div>
      </Box>

      <Box className="layer-weight-viz__stack-wrap">
        <div className="layer-weight-viz__axis" aria-hidden>
          <span>Output</span>
          <span className="layer-weight-viz__axis-line" />
          <span>Input</span>
        </div>

        <div className="layer-weight-viz__stack">
          {[...layers].reverse().map((layer) => (
            <div key={layer} className="layer-weight-viz__layer">
              <div className="layer-weight-viz__layer-head">
                <span className="layer-weight-viz__layer-name">{`Layer ${layer}`}</span>
                <span className="layer-weight-viz__layer-tag">{statusLabel()}</span>
              </div>
              <div className="layer-weight-viz__matrices">
                {ATTN.map((m) => {
                  const trainable = isTrainable(mode, m);
                  const showAdapters = mode !== 'full' && trainable;
                  const quantized = mode === 'qlora';

                  return (
                    <div
                      key={m}
                      className={
                        trainable
                          ? 'layer-weight-viz__matrix layer-weight-viz__matrix--lora'
                          : 'layer-weight-viz__matrix layer-weight-viz__matrix--frozen'
                      }
                    >
                      <div className="layer-weight-viz__matrix-label">
                        <strong>{m}</strong>
                        <span>
                          {mode === 'full'
                            ? 'W trains'
                            : showAdapters
                              ? quantized
                                ? 'W 4-bit · A,B train'
                                : 'W frozen · A,B train'
                              : quantized
                                ? 'W 4-bit frozen'
                                : 'W frozen'}
                        </span>
                      </div>
                      {showAdapters ? (
                        <div className="layer-weight-viz__adapters">
                          <div className="layer-weight-viz__adapter-block">
                            <span className="layer-weight-viz__adapter-name">A</span>
                            <WeightGrid
                              layer={layer}
                              matrix={`${m}A`}
                              cols={6}
                              rows={3}
                              step={step}
                              trainable
                            />
                          </div>
                          <div className="layer-weight-viz__adapter-block">
                            <span className="layer-weight-viz__adapter-name">B</span>
                            <WeightGrid
                              layer={layer}
                              matrix={`${m}B`}
                              cols={3}
                              rows={4}
                              step={step}
                              trainable
                            />
                          </div>
                        </div>
                      ) : (
                        <WeightGrid
                          layer={layer}
                          matrix={m}
                          cols={8}
                          rows={4}
                          step={step}
                          trainable={trainable}
                          quantized={quantized && !trainable}
                        />
                      )}
                      {quantized && showAdapters && (
                        <span className="layer-weight-viz__bit-note">base W also 4-bit</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Box>

      <Box className="layer-weight-viz__timeline">
        <div className="layer-weight-viz__timeline-labels">
          <span>Training step</span>
          <div className="layer-weight-viz__stepper">
            <IconButton
              type="button"
              size="small"
              className="layer-weight-viz__step-btn"
              aria-label="Decrease training step by 1"
              disabled={step <= 0}
              onClick={() => bumpStep(-1)}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <strong className="layer-weight-viz__step-value">
              {step} / {TOTAL_STEPS}
            </strong>
            <IconButton
              type="button"
              size="small"
              className="layer-weight-viz__step-btn"
              aria-label="Increase training step by 1"
              disabled={step >= TOTAL_STEPS}
              onClick={() => bumpStep(1)}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
        <Slider
          value={step}
          min={0}
          max={TOTAL_STEPS}
          step={1}
          onChange={(_, value) => setStep(Array.isArray(value) ? value[0] : value)}
          aria-label="Training time"
          className="layer-weight-viz__slider"
        />
        <div className="layer-weight-viz__timeline-ends">
          <span>t = 0 · start</span>
          <span>t = end · learned update</span>
        </div>
      </Box>

      <ul className="layer-weight-viz__keys">
        <li>
          <span className="layer-weight-viz__swatch layer-weight-viz__swatch--train" />
          {meta.legendTrain}
        </li>
        {mode !== 'full' && (
          <li>
            <span
              className={
                mode === 'qlora'
                  ? 'layer-weight-viz__swatch layer-weight-viz__swatch--quant'
                  : 'layer-weight-viz__swatch layer-weight-viz__swatch--frozen'
              }
            />
            {meta.legendFrozen}
          </li>
        )}
      </ul>
    </Box>
  );
}
