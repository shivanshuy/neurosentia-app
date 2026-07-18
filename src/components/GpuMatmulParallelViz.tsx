import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

const N = 4;
const CORE_SLOTS = 16; // N×N output cells

const A = [
  [1, 2, 0, 1],
  [0, 1, 3, 1],
  [2, 0, 1, 2],
  [1, 1, 0, 3],
];
const B = [
  [2, 0, 1, 1],
  [1, 3, 0, 2],
  [0, 1, 2, 1],
  [1, 0, 1, 2],
];

function partialSum(i: number, j: number, uptoK: number): number {
  let s = 0;
  for (let kk = 0; kk <= uptoK && kk < N; kk += 1) s += A[i][kk] * B[kk][j];
  return s;
}

function cellC(i: number, j: number): number {
  return partialSum(i, j, N - 1);
}

const ALL_CELLS = Array.from({ length: N * N }, (_, idx) => ({
  i: Math.floor(idx / N),
  j: idx % N,
}));

type ViewMode = 'gpu' | 'cpu';

/** GPU lockstep: every C[i,j] does mul then add for the same k, together. */
const GPU_WORK = N * 2;
const GPU_CYCLE = GPU_WORK + 3;

/** CPU/textbook: one C[i,j] at a time — fix B col j, walk A rows. */
const CPU_STEPS_PER_CELL = N * 2;
const CPU_WORK = N * N * CPU_STEPS_PER_CELL;
const CPU_CYCLE = CPU_WORK + 3;

function MatrixTable({
  label,
  data,
  highlightRow,
  highlightCol,
  pairRow,
  pairCol,
}: {
  label: string;
  data: number[][];
  highlightRow?: number | null;
  highlightCol?: number | null;
  pairRow?: number | null;
  pairCol?: number | null;
}) {
  return (
    <div className="gpu-mm-matrix">
      <span className="gpu-mm-matrix__label">{label}</span>
      <div
        className="gpu-mm-matrix__grid"
        style={{ gridTemplateColumns: `repeat(${data[0].length}, 1.65rem)` }}
      >
        {data.map((row, r) =>
          row.map((v, c) => {
            const band =
              (highlightRow != null && highlightRow === r) ||
              (highlightCol != null && highlightCol === c);
            const isPair = pairRow != null && pairCol != null && pairRow === r && pairCol === c;
            return (
              <span
                key={`${r}-${c}`}
                className={`gpu-mm-matrix__cell${band ? ' is-k' : ''}${isPair ? ' is-pair' : ''}`}
              >
                {v}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}

export default function GpuMatmulParallelViz() {
  const [mode, setMode] = useState<ViewMode>('gpu');
  const [step, setStep] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const cycle = mode === 'gpu' ? GPU_CYCLE : CPU_CYCLE;

  useEffect(() => {
    setStep(0);
    setFocusIdx(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => {
      setStep((s) => {
        const next = (s + 1) % cycle;
        if (mode === 'gpu' && next === 0) {
          setFocusIdx((f) => (f + 1) % ALL_CELLS.length);
        }
        return next;
      });
    }, 1100);
    return () => window.clearInterval(id);
  }, [playing, cycle, mode]);

  /* —— decode step by mode —— */
  let phase: 'mul' | 'add' | 'done';
  let k = 0;
  let i = 0;
  let j = 0;
  let uptoK = -1;
  let showMul = false;
  let done = false;

  if (mode === 'gpu') {
    done = step >= GPU_WORK;
    const workStep = Math.min(step, GPU_WORK - 1);
    k = Math.min(N - 1, Math.floor(workStep / 2));
    phase = done ? 'done' : workStep % 2 === 0 ? 'mul' : 'add';
    showMul = phase === 'mul';
    uptoK = done ? N - 1 : phase === 'add' ? k : k - 1;
    // Example core for A/B highlight: always row of A × column of B
    i = ALL_CELLS[focusIdx].i;
    j = ALL_CELLS[focusIdx].j;
  } else {
    done = step >= CPU_WORK;
    const cellIdx = done ? N * N - 1 : Math.floor(step / CPU_STEPS_PER_CELL);
    const within = done ? CPU_STEPS_PER_CELL - 1 : step % CPU_STEPS_PER_CELL;
    j = Math.floor(cellIdx / N);
    i = cellIdx % N;
    k = Math.min(N - 1, Math.floor(within / 2));
    phase = done ? 'done' : within % 2 === 0 ? 'mul' : 'add';
    showMul = phase === 'mul';
    uptoK = done ? N - 1 : phase === 'add' ? k : k - 1;
  }

  const product = A[i][k] * B[k][j];
  const accBefore = partialSum(i, j, k - 1);
  const accAfter = partialSum(i, j, k);

  const goPrev = () => {
    setPlaying(false);
    setStep((s) => {
      if (s <= 0) {
        if (mode === 'gpu') setFocusIdx((f) => (f - 1 + ALL_CELLS.length) % ALL_CELLS.length);
        return cycle - 1;
      }
      return s - 1;
    });
  };
  const goNext = () => {
    setPlaying(false);
    setStep((s) => {
      const next = (s + 1) % cycle;
      if (mode === 'gpu' && next === 0) {
        setFocusIdx((f) => (f + 1) % ALL_CELLS.length);
      }
      return next;
    });
  };
  const jumpPhase = (target: 'mul' | 'add' | 'done') => {
    setPlaying(false);
    if (target === 'done') {
      setStep(mode === 'gpu' ? GPU_WORK : CPU_WORK);
      return;
    }
    if (mode === 'gpu') {
      setStep(k * 2 + (target === 'add' ? 1 : 0));
    } else {
      const cellIdx = j * N + i;
      setStep(cellIdx * CPU_STEPS_PER_CELL + k * 2 + (target === 'add' ? 1 : 0));
    }
  };

  const cDisplay = (r: number, c: number): string | number => {
    if (mode === 'gpu') {
      if (showMul) return A[r][k] * B[k][c]; // products for this k
      if (uptoK < 0) return '·';
      return partialSum(r, c, uptoK);
    }
    // CPU: fill cells in order
    const idx = c * N + r;
    const curIdx = j * N + i;
    if (done) return cellC(r, c);
    if (idx < curIdx) return cellC(r, c);
    if (idx > curIdx) return '·';
    if (showMul) return product;
    if (uptoK < 0) return '·';
    return partialSum(r, c, uptoK);
  };

  return (
    <Box className="gpu-mm-viz" aria-label="CPU vs GPU matrix multiply visualization">
      <Typography component="p" className="gpu-mm-viz__title">
        How matrix multiply is scheduled
      </Typography>
      <Typography component="p" className="gpu-mm-viz__sub">
        Every C[i,j] is the dot product of <strong>row i of A</strong> with{' '}
        <strong>column j of B</strong>. A CPU-style loop finishes one pair before starting the next.
        A GPU keeps many pairs in flight: at step k, each core multiplies the k-th entry of its A-row
        by the k-th entry of its B-column, then accumulates — all cores advancing together.
      </Typography>

      <div className="gpu-mm-mode" role="group" aria-label="Scheduling view">
        <button
          type="button"
          className={`gpu-mm-mode__btn${mode === 'gpu' ? ' is-on' : ''}`}
          onClick={() => setMode('gpu')}
          aria-pressed={mode === 'gpu'}
        >
          GPU — all cells lockstep
        </button>
        <button
          type="button"
          className={`gpu-mm-mode__btn${mode === 'cpu' ? ' is-on' : ''}`}
          onClick={() => setMode('cpu')}
          aria-pressed={mode === 'cpu'}
        >
          CPU / textbook — one cell
        </button>
      </div>

      <div className="gpu-mm-legend">
        {showMul && (
          <span className="gpu-mm-legend__item">
            <span className="gpu-mm-legend__swatch gpu-mm-legend__swatch--warm" />
            Orange = <strong>row of A</strong> and <strong>column of B</strong> for the example
            cell C[{i},{j}]. Stronger cell = the k={k} entries along that row×column.
            {mode === 'gpu' ? ' (Every other core has its own row×column too — see cores below.)' : ''}
          </span>
        )}
        {phase === 'add' && (
          <span className="gpu-mm-legend__item">
            <span className="gpu-mm-legend__swatch gpu-mm-legend__swatch--green" />
            {mode === 'gpu'
              ? 'Green: every core adds into its own C[i,j] at once.'
              : 'Green: only this one C[i,j] accumulates.'}
          </span>
        )}
        {done && (
          <span className="gpu-mm-legend__item">
            <span className="gpu-mm-legend__swatch gpu-mm-legend__swatch--green" />
            Done — same C. Always row×column; GPU just runs many pairs together.
          </span>
        )}
      </div>

      <div className="gpu-mm-phase">
        <button
          type="button"
          className={`gpu-mm-phase__pill${showMul ? ' is-on' : ''}`}
          onClick={() => jumpPhase('mul')}
          aria-pressed={showMul}
        >
          1 · Multiply
        </button>
        <button
          type="button"
          className={`gpu-mm-phase__pill${phase === 'add' ? ' is-on' : ''}`}
          onClick={() => jumpPhase('add')}
          aria-pressed={phase === 'add'}
        >
          2 · Accumulate
        </button>
        <button
          type="button"
          className={`gpu-mm-phase__pill${done ? ' is-on' : ''}`}
          onClick={() => jumpPhase('done')}
          aria-pressed={done}
        >
          3 · C ready
        </button>
        <span className="gpu-mm-phase__k">
          {done
            ? 'all done'
            : mode === 'gpu'
              ? `example: row ${i} of A × col ${j} of B · k=${k}/${N - 1} · all 16 cores live`
              : `row ${i} of A × col ${j} of B · k=${k}/${N - 1}`}
        </span>
      </div>

      <div className="gpu-mm-stepper" role="group" aria-label="Step controls">
        <button type="button" className="gpu-mm-stepper__btn" onClick={goPrev}>
          ← Prev
        </button>
        <button
          type="button"
          className={`gpu-mm-stepper__btn${playing ? ' is-playing' : ''}`}
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="gpu-mm-stepper__btn" onClick={goNext}>
          Next →
        </button>
        {mode === 'gpu' && (
          <button
            type="button"
            className="gpu-mm-stepper__btn"
            onClick={() => {
              setPlaying(false);
              setFocusIdx((f) => (f + 1) % ALL_CELLS.length);
            }}
          >
            Next example cell
          </button>
        )}
        <span className="gpu-mm-stepper__hint">
          {mode === 'gpu'
            ? 'A/B show one example row×column; cores show all 16 in parallel'
            : 'One output cell at a time'}
        </span>
      </div>

      <div
        className={`gpu-mm-viz__mats${showMul ? ' is-phase-mul' : ''}${phase === 'add' ? ' is-phase-add' : ''}`}
      >
        <div className={`gpu-mm-panel${phase === 'add' || done ? ' is-dim' : ''}`}>
          <MatrixTable
            label={`A — row i=${showMul ? i : '·'}`}
            data={A}
            highlightRow={showMul ? i : null}
            pairRow={showMul ? i : null}
            pairCol={showMul ? k : null}
          />
        </div>
        <span className="gpu-mm-viz__op">×</span>
        <div className={`gpu-mm-panel${phase === 'add' || done ? ' is-dim' : ''}`}>
          <MatrixTable
            label={`B — column j=${showMul ? j : '·'}`}
            data={B}
            highlightCol={showMul ? j : null}
            pairRow={showMul ? k : null}
            pairCol={showMul ? j : null}
          />
        </div>
        <span className="gpu-mm-viz__op">→</span>
        <div className="gpu-mm-matrix gpu-mm-panel">
          <span className="gpu-mm-matrix__label">
            {done
              ? 'C (final) — identical in both modes'
              : mode === 'gpu' && showMul
                ? `Products for every C[i,j] at k=${k}`
                : mode === 'gpu'
                  ? `C accumulators after k ≤ ${uptoK} (all cells)`
                  : showMul
                    ? `Product for C[${i},${j}] only`
                    : `C — working on [${i},${j}]`}
          </span>
          <div
            className="gpu-mm-matrix__grid"
            style={{ gridTemplateColumns: `repeat(${N}, 1.65rem)` }}
          >
            {ALL_CELLS.map(({ i: r, j: c }) => {
              const activeExample = !done && r === i && c === j;
              const val = cDisplay(r, c);
              return (
                <span
                  key={`${r}-${c}`}
                  className={`gpu-mm-matrix__cell${showMul && (mode === 'gpu' || activeExample) ? ' is-product' : ''}${!showMul && val !== '·' ? ' is-done' : ''}${done ? ' is-final' : ''}${activeExample ? ' is-active-cell' : ''}`}
                >
                  {val}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {mode === 'gpu' ? (
        <div className="gpu-mm-cores" role="img" aria-label="GPU cores in lockstep">
          {Array.from({ length: CORE_SLOTS }, (_, idx) => {
            const cell = ALL_CELLS[idx];
            const mul = A[cell.i][k] * B[k][cell.j];
            const prev = partialSum(cell.i, cell.j, k - 1);
            const acc = partialSum(cell.i, cell.j, k);
            const isFocus = cell.i === i && cell.j === j;
            return (
              <div
                key={idx}
                className={`gpu-mm-core is-busy${showMul ? ' is-mul' : ''}${phase === 'add' ? ' is-add' : ''}${done ? ' is-complete' : ''}${isFocus ? ' is-focus' : ''}`}
              >
                <span className="gpu-mm-core__id">
                  C[{cell.i},{cell.j}] · row{cell.i}×col{cell.j}
                </span>
                {done ? (
                  <span className="gpu-mm-core__job">Σ → {cellC(cell.i, cell.j)}</span>
                ) : showMul ? (
                  <span className="gpu-mm-core__job">
                    {A[cell.i][k]}×{B[k][cell.j]}={mul}
                  </span>
                ) : (
                  <span className="gpu-mm-core__job">
                    {prev}+{mul}={acc}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="gpu-mm-col-cores">
          <span className="gpu-mm-col-cores__label">
            CPU-style: only one row×column pair is live (others wait)
          </span>
          <div className="gpu-mm-col-cores__grid">
            {Array.from({ length: N }, (_, row) => {
              const active = !done && row === i;
              const fullyDone = done || j * N + row < j * N + i;
              const mul = A[row][k] * B[k][j];
              const prev = partialSum(row, j, k - 1);
              const acc = partialSum(row, j, k);
              return (
                <div
                  key={row}
                  className={`gpu-mm-core${active ? ' is-busy' : ''}${active && showMul ? ' is-mul' : ''}${active && phase === 'add' ? ' is-add' : ''}${fullyDone && !active ? ' is-complete' : ''}`}
                >
                  <span className="gpu-mm-core__id">
                    A row {row} × B col {j} → C[{row},{j}]
                  </span>
                  {fullyDone && !active ? (
                    <span className="gpu-mm-core__job">Σ → {cellC(row, j)}</span>
                  ) : !active ? (
                    <span className="gpu-mm-core__job gpu-mm-core__job--idle">waiting</span>
                  ) : showMul ? (
                    <span className="gpu-mm-core__job">
                      {A[row][k]}×{B[k][j]}={mul}
                    </span>
                  ) : (
                    <span className="gpu-mm-core__job">
                      {prev}+{mul}={acc}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Typography component="p" className="gpu-mm-viz__eq">
        {done ? (
          <>
            <strong>Same answer:</strong> scheduling changed, math did not. C[0,0] = {cellC(0, 0)}.
          </>
        ) : mode === 'gpu' && showMul ? (
          <>
            <strong>Example cell C[{i},{j}]:</strong> row {i} of A × column {j} of B at k={k}: A[
            {i},{k}] · B[{k},{j}] = {product}. The core grid shows every other C[r,c] doing the same
            for its own row×column at this k.
          </>
        ) : mode === 'gpu' ? (
          <>
            <strong>Accumulate (all cores):</strong> example C[{i},{j}] ← {accBefore} + {product} ={' '}
            {accAfter}. Same step on every core for its own row×column.
          </>
        ) : showMul ? (
          <>
            <strong>One row×column:</strong> row {i} of A × column {j} of B, k={k}: A[{i},{k}]·B[
            {k},{j}] = {product}.
          </>
        ) : (
          <>
            <strong>Accumulate that pair:</strong> C[{i},{j}] ← {accBefore} + {product} = {accAfter}.
          </>
        )}
      </Typography>
    </Box>
  );
}
