import Box from '@mui/material/Box';
import { useNavigate } from 'react-router';

type BlogItem = {
  moreLink: string;
  header: string;
  text: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  imageVariant: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};

const blogList: BlogItem[] = [
  {
    moreLink: '/llama-cpp',
    header: 'llama.cpp: the engine that put LLMs on your laptop',
    text: 'Need → architecture → Windows/Linux install → Ollama vs engine → HF/GGUF. Interactive visuals, verified facts, engineer-friendly.',
    category: 'Deep dive',
    readTime: '17 min read',
    date: 'Jul 18, 2026',
    tags: ['llama.cpp', 'GGUF', 'ggml'],
    imageVariant: 9,
  },
  {
    moreLink: '/llm-datasets',
    header: 'LLM training datasets: teach the model what to want',
    text: 'Instruction vs chat vs preference — real JSON examples, Llama/Mistral/Qwen templates, public packs, and playbooks to build your own for support, SQL, tools, and RAG.',
    category: 'Fine-tuning',
    readTime: '16 min read',
    date: 'Jul 18, 2026',
    tags: ['Datasets', 'SFT', 'Alpaca'],
    imageVariant: 8,
  },
  {
    moreLink: '/llm-quantization',
    header: 'LLM quantization: smaller weights, same brain (almost)',
    text: 'You download a 70B model. It will not fit. Quantization is the plot twist — fewer bits, GGUF, GPTQ/AWQ, and how to keep the intelligence.',
    category: 'Deep dive',
    readTime: '18 min read',
    date: 'Jul 18, 2026',
    tags: ['Quantization', 'GGUF', 'INT4'],
    imageVariant: 7,
  },
  {
    moreLink: '/gpu-llm-inference',
    header: 'Why GPUs run LLMs (and CPUs usually do not)',
    text: 'What happens when you type a prompt, why that work is matrix multiply, and how GPU parallelism — not raw “smartness” — turns GEMM into tokens.',
    category: 'Fundamentals',
    readTime: '12 min read',
    date: 'Jul 18, 2026',
    tags: ['GPU', 'Inference', 'Training'],
    imageVariant: 5,
  },
  {
    moreLink: '/llm-model-files',
    header: 'How LLM model files are stored',
    text: 'A guided tour of Hugging Face model repos using openai/gpt-oss-20b: config, Safetensors shards, tokenizer files, and what each one is for.',
    category: 'Fundamentals',
    readTime: '11 min read',
    date: 'Jul 18, 2026',
    tags: ['Safetensors', 'Hugging Face', 'LLMs'],
    imageVariant: 6,
  },
  {
    moreLink: '/lora-fine-tuning',
    header: 'LoRA fine-tuning',
    text: 'How Low-Rank Adaptation works, which knobs matter (rank, alpha, modules), and a full engineer-oriented walkthrough with math, diagrams, and PEFT code.',
    category: 'Deep dive',
    readTime: '12 min read',
    date: 'Jul 17, 2026',
    tags: ['LoRA', 'PEFT', 'CPU'],
    imageVariant: 1,
  },
  {
    moreLink: '/fine-tuning-techniques',
    header: 'Fine-tuning techniques',
    text: 'A quick tour of full SFT, LoRA, QLoRA, other PEFT methods, embedding fine-tunes, and when to use each.',
    category: 'Fine-tuning',
    readTime: '7 min read',
    date: 'Jul 16, 2026',
    tags: ['LoRA', 'QLoRA', 'LLMs'],
    imageVariant: 2,
  },
  {
    moreLink: '/react-agent-langgraph',
    header: 'React Agent with LangGraph',
    text: "A practical ReAct agent example using LangGraph and Ollama's Mistral model.",
    category: 'Build',
    readTime: '8 min read',
    date: 'Jul 14, 2026',
    tags: ['LangGraph', 'ReAct', 'Ollama'],
    imageVariant: 3,
  },
  {
    moreLink: '/ai-agents',
    header: 'AI Agents',
    text: 'Systems that use an LLM to reason through a problem, create a plan, and execute it with tools.',
    category: 'Concepts',
    readTime: '6 min read',
    date: 'Jul 12, 2026',
    tags: ['Agents', 'LLMs', 'Tools'],
    imageVariant: 4,
  },
];

function ThumbArt({ variant }: { variant: BlogItem['imageVariant'] }) {
  const ink = '#8a8a8a';
  const paper = '#ffffff';
  const sw = 1.05;

  switch (variant) {
    case 1: {
      /* Vertical line-screen: hairline at top → thick at bottom */
      const gap = 4.2;
      const count = Math.ceil(400 / gap) + 1;
      const wTop = 0.55;
      const wBot = 3.55;
      return (
        <svg className="blog-thumb__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width="400" height="320" fill="#ffffff" />
          {Array.from({ length: count }, (_, i) => {
            const cx = i * gap;
            return (
              <polygon
                key={i}
                points={`${cx - wTop / 2},0 ${cx + wTop / 2},0 ${cx + wBot / 2},320 ${cx - wBot / 2},320`}
                fill="#0a0a0a"
              />
            );
          })}
        </svg>
      );
    }
    case 2: {
      /* Hatch lanes with open circle nodes */
      const circles = [
        [70, 60, 28], [180, 90, 42], [310, 55, 22],
        [120, 180, 36], [260, 170, 48], [70, 260, 20],
        [200, 250, 30], [340, 230, 34], [150, 120, 16],
      ] as const;
      return (
        <svg className="blog-thumb__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width="400" height="320" fill={paper} />
          {Array.from({ length: 12 }, (_, lane) => {
            const x0 = lane * 36 - 8;
            const x1 = x0 + 28;
            return Array.from({ length: 90 }, (_, i) => (
              <line
                key={`${lane}-${i}`}
                x1={x0 + (lane % 2) * 2}
                y1={i * 4 - 4}
                x2={x1 - (lane % 2) * 2}
                y2={i * 4 - 4}
                stroke={ink}
                strokeWidth={0.8}
              />
            ));
          })}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 36 + 6}
              y1="0"
              x2={i * 36 + 10}
              y2="320"
              stroke={ink}
              strokeWidth={sw}
            />
          ))}
          {circles.map(([cx, cy, r], i) => (
            <circle key={`fill-${i}`} cx={cx} cy={cy} r={r} fill={paper} />
          ))}
          {circles.map(([cx, cy, r], i) => (
            <circle key={`ring-${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={ink} strokeWidth={sw} />
          ))}
        </svg>
      );
    }
    case 3: {
      /* Contour / zen-garden flow lines — parallel undulating streams */
      const ink = '#b8b8b8';
      const paths: string[] = [];
      const lineCount = 78;
      const xStep = 5;

      for (let i = 0; i < lineCount; i += 1) {
        const baseY = i * 4.35 - 20;
        let d = '';
        for (let x = -10; x <= 410; x += xStep) {
          const t = x / 400;
          /* Multiple flow centers create stream “islands” */
          const a =
            Math.sin(t * Math.PI * 2.2 + i * 0.07) * 16 +
            Math.sin(t * Math.PI * 3.6 + 1.2) * 9;
          const b =
            Math.sin((t - 0.35) * Math.PI * 2.8 + i * 0.05) *
            Math.cos(baseY * 0.018) *
            22;
          const c =
            Math.sin((t - 0.7) * Math.PI * 2.1 + 0.4) *
            Math.sin(baseY * 0.014 + 1) *
            18;
          /* Soft ridges where streams meet */
          const ridge =
            Math.tanh(Math.sin(t * Math.PI * 3 + baseY * 0.025) * 2.2) * 14 +
            Math.tanh(Math.sin(t * Math.PI * 1.6 + 2.1 + baseY * 0.01) * 1.8) * 10;
          const y = baseY + a + b + c + ridge;
          d += d === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        paths.push(d);
      }

      /* Extra curved pocket streams (left + right) for organic boundaries */
      for (let i = 0; i < 28; i += 1) {
        const cx = 70;
        const cy = 150;
        const r = 28 + i * 4.2;
        const start = -1.15;
        const end = 1.15;
        let d = '';
        for (let s = 0; s <= 24; s += 1) {
          const ang = start + ((end - start) * s) / 24;
          const x = cx + Math.sin(ang) * r * 0.55 + i * 0.15;
          const y = cy + Math.cos(ang) * r;
          d += s === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        paths.push(d);
      }
      for (let i = 0; i < 24; i += 1) {
        const cx = 330;
        const cy = 120;
        const r = 22 + i * 4.5;
        const start = 0.2;
        const end = 2.6;
        let d = '';
        for (let s = 0; s <= 24; s += 1) {
          const ang = start + ((end - start) * s) / 24;
          const x = cx + Math.cos(ang) * r;
          const y = cy + Math.sin(ang) * r * 0.85;
          d += s === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        paths.push(d);
      }

      return (
        <svg className="blog-thumb__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <linearGradient id="v3-vig" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ececec" />
              <stop offset="42%" stopColor="#ffffff" />
              <stop offset="58%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ebebeb" />
            </linearGradient>
          </defs>
          <rect width="400" height="320" fill="url(#v3-vig)" />
          {paths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={ink} strokeWidth={0.95} strokeLinecap="round" />
          ))}
        </svg>
      );
    }
    case 4: {
      /* Op-art tiles: L-arcs + diagonal hatch */
      const size = 50;
      return (
        <svg className="blog-thumb__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width="400" height="320" fill={paper} />
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 9 }, (_, col) => {
              const x = col * size;
              const y = row * size;
              const steps = 6;
              return (
                <g key={`${row}-${col}`}>
                  <line x1={x} y1={y + size} x2={x + size} y2={y} stroke={ink} strokeWidth={sw} />
                  {Array.from({ length: steps }, (_, i) => {
                    const t = ((i + 1) / (steps + 1)) * size;
                    return (
                      <path
                        key={`l-${i}`}
                        d={`M ${x} ${y + size - t} L ${x} ${y + size} L ${x + t} ${y + size}`}
                        fill="none"
                        stroke={ink}
                        strokeWidth={sw}
                      />
                    );
                  })}
                  {Array.from({ length: steps }, (_, i) => {
                    const t = ((i + 1) / (steps + 1)) * size;
                    return (
                      <line
                        key={`d-${i}`}
                        x1={x + t}
                        y1={y}
                        x2={x + size}
                        y2={y + size - t}
                        stroke={ink}
                        strokeWidth={sw}
                      />
                    );
                  })}
                </g>
              );
            }),
          )}
        </svg>
      );
    }
    case 5: {
      /* Low-poly facets — each triangle has its own light→dark gradient */
      const W = 400;
      const H = 320;
      const cols = 11;
      const rows = 8;
      const hash = (a: number, b: number) => {
        const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
        return n - Math.floor(n);
      };
      const shade = (t: number) => {
        const v = Math.round(18 + Math.min(1, Math.max(0, t)) * 220);
        return `rgb(${v},${v},${v})`;
      };

      const pts: Array<Array<[number, number]>> = [];
      for (let r = 0; r <= rows; r += 1) {
        const row: Array<[number, number]> = [];
        for (let c = 0; c <= cols; c += 1) {
          const edgeX = c === 0 || c === cols;
          const edgeY = r === 0 || r === rows;
          const jx = edgeX ? 0 : (hash(c, r) - 0.5) * (W / cols) * 0.85;
          const jy = edgeY ? 0 : (hash(r, c + 9) - 0.5) * (H / rows) * 0.85;
          row.push([(c / cols) * W + jx, (r / rows) * H + jy]);
        }
        pts.push(row);
      }

      type Facet = {
        id: string;
        points: string;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        c0: string;
        c1: string;
      };
      const facets: Facet[] = [];
      let fi = 0;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const p00 = pts[r][c];
          const p10 = pts[r][c + 1];
          const p01 = pts[r + 1][c];
          const p11 = pts[r + 1][c + 1];
          const flip = (r + c) % 2 === 0;
          const tris: Array<[[number, number], [number, number], [number, number]]> = flip
            ? [
                [p00, p10, p11],
                [p00, p11, p01],
              ]
            : [
                [p00, p10, p01],
                [p10, p11, p01],
              ];
          for (const tri of tris) {
            const h0 = hash(fi, 1);
            const h1 = hash(fi, 2);
            const ai = Math.floor(h0 * 3) % 3;
            const bi = (ai + 1 + Math.floor(h1 * 2)) % 3;
            const a = tri[ai];
            const b = tri[bi];
            facets.push({
              id: `v5g${fi}`,
              points: `${tri[0][0]},${tri[0][1]} ${tri[1][0]},${tri[1][1]} ${tri[2][0]},${tri[2][1]}`,
              x1: a[0],
              y1: a[1],
              x2: b[0],
              y2: b[1],
              c0: shade(0.55 + h0 * 0.45),
              c1: shade(h1 * 0.4),
            });
            fi += 1;
          }
        }
      }

      return (
        <svg className="blog-thumb__art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            {facets.map((f) => (
              <linearGradient
                key={f.id}
                id={f.id}
                gradientUnits="userSpaceOnUse"
                x1={f.x1}
                y1={f.y1}
                x2={f.x2}
                y2={f.y2}
              >
                <stop offset="0%" stopColor={f.c0} />
                <stop offset="100%" stopColor={f.c1} />
              </linearGradient>
            ))}
          </defs>
          <rect width={W} height={H} fill="#efefef" />
          {facets.map((f) => (
            <polygon key={f.id} points={f.points} fill={`url(#${f.id})`} stroke="#c8c8c8" strokeWidth={0.3} />
          ))}
        </svg>
      );
    }
    case 6: {
      /* Hex-of-triangles field — dense bottom-left → sparse top-right */
      const R = 11;
      const paper = '#f5f5f0';
      const ink = '#0a0a0a';
      const polys: string[] = [];

      const hash = (a: number, b: number, c: number) => {
        const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.3) * 43758.5453;
        return n - Math.floor(n);
      };

      const hexDx = R * 1.5;
      const hexDy = R * Math.sqrt(3);

      for (let row = -2; row < 22; row += 1) {
        for (let col = -2; col < 30; col += 1) {
          const cx = col * hexDx;
          const cy = row * hexDy + (col % 2 === 0 ? 0 : hexDy / 2);
          const dens = Math.min(
            1,
            Math.max(0, (1 - cx / 410) * 0.62 + (cy / 330) * 0.58),
          );
          const threshold = dens * dens * 0.85 + dens * 0.15;

          for (let k = 0; k < 6; k += 1) {
            if (hash(col, row, k) > threshold) continue;
            const a0 = (-Math.PI / 2 + (k * Math.PI) / 3) ;
            const a1 = (-Math.PI / 2 + ((k + 1) * Math.PI) / 3);
            const inset = 0.88;
            const x0 = cx + Math.cos(a0) * R * inset;
            const y0 = cy + Math.sin(a0) * R * inset;
            const x1 = cx + Math.cos(a1) * R * inset;
            const y1 = cy + Math.sin(a1) * R * inset;
            const ix = cx + (Math.cos(a0) + Math.cos(a1)) * R * 0.06;
            const iy = cy + (Math.sin(a0) + Math.sin(a1)) * R * 0.06;
            polys.push(`${ix},${iy} ${x0},${y0} ${x1},${y1}`);
          }
        }
      }

      return (
        <svg className="blog-thumb__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width="400" height="320" fill={paper} />
          {polys.map((points, i) => (
            <polygon key={i} points={points} fill={ink} />
          ))}
        </svg>
      );
    }
    case 7: {
      /* Concentric ring field — staggered overlapping circles (seigaiha-like) */
      const ink = '#2a2a2a';
      const paper = '#ececec';
      const centers: Array<[number, number]> = [];
      const colStep = 52;
      const rowStep = 45;
      for (let row = -1; row < 9; row += 1) {
        for (let col = -1; col < 10; col += 1) {
          const cx = col * colStep + (row % 2 === 0 ? 0 : colStep / 2);
          const cy = row * rowStep + 8;
          centers.push([cx, cy]);
        }
      }
      /* Draw back-to-front so overlaps read as layered */
      const ordered = [...centers].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      const rings = [6, 14, 22, 30];

      return (
        <svg className="blog-thumb__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width="400" height="320" fill={paper} />
          {ordered.map(([cx, cy], i) => (
            <g key={i}>
              {rings.map((r) => (
                <circle
                  key={r}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={ink}
                  strokeWidth={1.15}
                />
              ))}
              <circle cx={cx} cy={cy} r={2.2} fill={ink} />
            </g>
          ))}
        </svg>
      );
    }
    case 8: {
      /* Capsule / cell outlines */
      return (
        <svg className="blog-thumb__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width="400" height="320" fill={paper} />
          {Array.from({ length: 10 }, (_, row) =>
            Array.from({ length: 12 }, (_, col) => {
              const x = col * 36 - 8 + (row % 2) * 10;
              const y = row * 34 - 6;
              const w = 28 + ((row * 3 + col) % 5);
              const h = 22 + ((row + col) % 4);
              const rx = Math.min(w, h) / 2;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={rx}
                  ry={rx}
                  fill="none"
                  stroke={ink}
                  strokeWidth={sw}
                />
              );
            }),
          )}
        </svg>
      );
    }
    case 9: {
      /* Isometric cubes — white top → solid black bottom (density gradient) */
      const W = 720;
      const H = 280;
      const stepX = 26;
      const stepY = 15;
      const maxHalf = 13;
      const faces: Array<{ points: string; key: string }> = [];

      for (let row = -2; row < Math.ceil(H / stepY) + 4; row += 1) {
        for (let col = -2; col < Math.ceil(W / stepX) + 4; col += 1) {
          const cx = col * stepX + (row % 2 === 0 ? 0 : stepX / 2);
          const cy = row * stepY;
          /* 0 at top (sparse), 1 at bottom (dense) */
          const t = Math.min(1, Math.max(0, cy / (H * 0.92)));
          const density = t * t * (3 - 2 * t); /* smoothstep */
          const s = Math.max(0.5, maxHalf * (0.035 + 0.965 * density));
          const hx = s;
          const hy = s * 0.58;
          const depth = s * 1.05;

          const top = `${cx},${cy - hy} ${cx + hx},${cy} ${cx},${cy + hy} ${cx - hx},${cy}`;
          faces.push({ key: `${row}-${col}-t`, points: top });

          /* Side faces only once cubes have enough mass — top stays diamond speckles */
          if (density > 0.22) {
            const left = `${cx - hx},${cy} ${cx},${cy + hy} ${cx},${cy + hy + depth} ${cx - hx},${cy + depth}`;
            const right = `${cx + hx},${cy} ${cx},${cy + hy} ${cx},${cy + hy + depth} ${cx + hx},${cy + depth}`;
            faces.push({ key: `${row}-${col}-l`, points: left });
            faces.push({ key: `${row}-${col}-r`, points: right });
          }
        }
      }

      return (
        <svg className="blog-thumb__art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width={W} height={H} fill="#ffffff" />
          {faces.map(({ key, points }) => (
            <polygon
              key={key}
              points={points}
              fill="#0a0a0a"
              stroke="#ffffff"
              strokeWidth={0.9}
              strokeLinejoin="round"
            />
          ))}
        </svg>
      );
    }
    default: {
      /* Wireframe boxes */
      return (
        <svg className="blog-thumb__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width="400" height="320" fill={paper} />
          {Array.from({ length: 9 }, (_, row) =>
            Array.from({ length: 11 }, (_, col) => {
              const cx = 20 + col * 36;
              const cy = 20 + row * 34;
              const s = 10 + ((row + col) % 4) * 2;
              const skew = ((row - 4) * 1.2 + (col - 5) * 0.8);
              return (
                <g key={`${row}-${col}`} transform={`translate(${cx} ${cy}) rotate(${skew})`}>
                  <rect x={-s} y={-s * 0.7} width={s * 2} height={s * 1.4} fill="none" stroke={ink} strokeWidth={sw} />
                  <rect x={-s * 0.45} y={-s * 0.3} width={s * 0.9} height={s * 0.6} fill="none" stroke={ink} strokeWidth={sw} />
                </g>
              );
            }),
          )}
        </svg>
      );
    }
  }
}

function Thumb({ variant, className }: { variant: BlogItem['imageVariant']; className?: string }) {
  return (
    <div className={`blog-thumb blog-thumb--v${variant}${className ? ` ${className}` : ''}`} aria-hidden>
      <ThumbArt variant={variant} />
    </div>
  );
}

function BlogCard({ item }: { item: BlogItem }) {
  const navigate = useNavigate();
  return (
    <button type="button" className="blog-card" onClick={() => navigate(item.moreLink)}>
      <span className="blog-card__media">
        <Thumb variant={item.imageVariant} className="blog-card__thumb" />
      </span>
      <span className="blog-card__body">
        <span className="blog-card__cat">{item.category}</span>
        <span className="blog-card__title">{item.header}</span>
        <span className="blog-card__excerpt">{item.text}</span>
        <span className="blog-card__meta">
          {item.date} · {item.readTime}
        </span>
      </span>
    </button>
  );
}

export default function AIBlogItems() {
  const navigate = useNavigate();
  const [featured, ...gridPosts] = blogList;

  return (
    <Box className="app-content-page canvas-blog-page blog-feed-page">
      <Box className="canvas-blog-shell blog-feed-shell">
        <header className="canvas-blog-masthead canvas-blog-masthead--light">
          <button type="button" className="canvas-blog-brand" onClick={() => navigate('/ai-blog-items')}>
            Recent posts
          </button>
          <nav className="canvas-blog-nav" aria-label="Blog sections">
            <button type="button" onClick={() => navigate('/ai-blog-items')}>
              Latest
            </button>
            <button type="button" onClick={() => navigate('/ai-agents')}>
              Agents
            </button>
            <button type="button" onClick={() => navigate('/fine-tuning-techniques')}>
              Fine-tuning
            </button>
            <button type="button" onClick={() => navigate('/lora-fine-tuning')}>
              LoRA
            </button>
            <button type="button" onClick={() => navigate('/llm-model-files')}>
              Model files
            </button>
            <button type="button" onClick={() => navigate('/gpu-llm-inference')}>
              GPUs
            </button>
            <button type="button" onClick={() => navigate('/llm-quantization')}>
              Quantization
            </button>
            <button type="button" onClick={() => navigate('/llm-datasets')}>
              Datasets
            </button>
            <button type="button" onClick={() => navigate('/llama-cpp')}>
              llama.cpp
            </button>
          </nav>
        </header>

        <div className="blog-feed">
          {featured && (
            <button
              type="button"
              className="blog-feature"
              onClick={() => navigate(featured.moreLink)}
            >
              <span className="blog-feature__body">
                <span className="blog-card__cat">{featured.category}</span>
                <span className="blog-feature__title">{featured.header}</span>
                <span className="blog-card__excerpt blog-feature__excerpt">{featured.text}</span>
                <span className="blog-card__meta">
                  {featured.date} · {featured.readTime}
                </span>
              </span>
              <span className="blog-feature__media">
                <Thumb variant={featured.imageVariant} className="blog-feature__thumb" />
              </span>
            </button>
          )}

          <div className="blog-grid">
            {gridPosts.map((item) => (
              <BlogCard key={item.moreLink} item={item} />
            ))}
          </div>
        </div>
      </Box>
    </Box>
  );
}
