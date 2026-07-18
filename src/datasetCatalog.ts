import type { FineTuneTechniqueId } from './fineTuneCatalog';

export type DatasetGoal = 'chat' | 'code' | 'math' | 'embedding' | 'multilingual' | 'general';

export type CuratedDataset = {
  id: string;
  name: string;
  description: string;
  goal: DatasetGoal;
  techniques: FineTuneTechniqueId[];
  sizeHint: string;
  license: string;
  commercialOk: boolean;
  hfUrl: string;
  /** Bundled sample under public/datasets/samples/ */
  localSampleId?: string;
  cpuSampleRows: string;
  tags: string[];
};

export const DATASET_GOAL_LABELS: Record<DatasetGoal, string> = {
  chat: 'Chat & instructions',
  code: 'Code',
  math: 'Math & reasoning',
  embedding: 'Embeddings / RAG',
  multilingual: 'Multilingual',
  general: 'General',
};

export const CURATED_DATASETS: CuratedDataset[] = [
  {
    id: 'oasst1',
    name: 'OpenAssistant OASST1',
    description: 'Human-written multi-turn conversations. Classic starter for chat instruction tuning.',
    goal: 'chat',
    techniques: ['lora-sft', 'full-sft'],
    sizeHint: '~88k messages (sample 5k–20k for CPU)',
    license: 'Apache-2.0',
    commercialOk: true,
    hfUrl: 'https://huggingface.co/datasets/OpenAssistant/oasst1',
    cpuSampleRows: '5k–20k',
    tags: ['conversation', 'human-written'],
  },
  {
    id: 'openhermes',
    name: 'OpenHermes 2.5',
    description: 'Large mixed instruction dataset covering chat, reasoning, and tool-style tasks.',
    goal: 'general',
    techniques: ['lora-sft'],
    sizeHint: '~1M rows (subset heavily for CPU)',
    license: 'Mixed — check subset',
    commercialOk: false,
    hfUrl: 'https://huggingface.co/datasets/teknium/OpenHermes-2.5',
    cpuSampleRows: '5k–50k subset',
    tags: ['instruction', 'mixed'],
  },
  {
    id: 'infinity-instruct',
    name: 'Infinity Instruct',
    description: 'Large filtered instruction mix from BAAI — strong for math, code, and chat splits.',
    goal: 'general',
    techniques: ['lora-sft'],
    sizeHint: '3M–7M (use Foundational subset)',
    license: 'Check HF card',
    commercialOk: false,
    hfUrl: 'https://huggingface.co/datasets/BAAI/Infinity-Instruct',
    cpuSampleRows: '10k–50k',
    tags: ['instruction', 'math', 'code'],
  },
  {
    id: 'magicoder',
    name: 'Magicoder-OSS-Instruct',
    description: '75k code instruction examples distilled from open-source code. Great for small code models.',
    goal: 'code',
    techniques: ['lora-sft'],
    sizeHint: '~75k',
    license: 'Apache-2.0',
    commercialOk: true,
    hfUrl: 'https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K',
    localSampleId: 'code-instruct-sample',
    cpuSampleRows: '5k–75k',
    tags: ['code', 'python'],
  },
  {
    id: 'opencodeinstruct',
    name: 'OpenCodeInstruct',
    description: 'NVIDIA’s large code instruction set for supervised fine-tuning of code LLMs.',
    goal: 'code',
    techniques: ['lora-sft'],
    sizeHint: '~5M (sample for CPU)',
    license: 'Check HF card',
    commercialOk: false,
    hfUrl: 'https://huggingface.co/datasets/nvidia/OpenCodeInstruct',
    localSampleId: 'code-instruct-sample',
    cpuSampleRows: '5k–30k',
    tags: ['code', 'large'],
  },
  {
    id: 'metamath',
    name: 'MetaMathQA',
    description: 'Math word problems with step-by-step solutions. Good for reasoning on tiny models.',
    goal: 'math',
    techniques: ['lora-sft'],
    sizeHint: '~395k',
    license: 'MIT',
    commercialOk: true,
    hfUrl: 'https://huggingface.co/datasets/meta-math/MetaMathQA',
    cpuSampleRows: '2k–20k',
    tags: ['math', 'reasoning'],
  },
  {
    id: 'ms-marco',
    name: 'MS MARCO',
    description: 'Passage ranking and QA pairs widely used for retrieval and embedding benchmarks.',
    goal: 'embedding',
    techniques: ['embedding-sft'],
    sizeHint: 'Millions of pairs (sample thousands)',
    license: 'MS MARCO License',
    commercialOk: false,
    hfUrl: 'https://huggingface.co/datasets/ms_marco',
    localSampleId: 'embedding-pairs-sample',
    cpuSampleRows: '1k–10k pairs',
    tags: ['retrieval', 'search'],
  },
  {
    id: 'demo-chat',
    name: 'Neurosentia chat sample',
    description: 'Tiny bundled JSONL to try instruction tuning without downloading external data.',
    goal: 'chat',
    techniques: ['lora-sft', 'full-sft'],
    sizeHint: '3 rows',
    license: 'Demo / internal',
    commercialOk: true,
    hfUrl: '',
    localSampleId: 'chat-instruct-sample',
    cpuSampleRows: '3',
    tags: ['demo', 'bundled'],
  },
  {
    id: 'demo-embedding',
    name: 'Neurosentia embedding sample',
    description: 'Tiny query/positive pairs for embedding fine-tune demos.',
    goal: 'embedding',
    techniques: ['embedding-sft'],
    sizeHint: '3 rows',
    license: 'Demo / internal',
    commercialOk: true,
    hfUrl: '',
    localSampleId: 'embedding-pairs-sample',
    cpuSampleRows: '3',
    tags: ['demo', 'bundled'],
  },
];

export type DatasetTemplate = {
  id: string;
  label: string;
  technique: FineTuneTechniqueId;
  filename: string;
  description: string;
};

export const DATASET_TEMPLATES: DatasetTemplate[] = [
  {
    id: 'alpaca',
    label: 'Alpaca JSONL',
    technique: 'lora-sft',
    filename: 'alpaca-template.jsonl',
    description: 'instruction / input / output fields — default for LoRA SFT.',
  },
  {
    id: 'sharegpt',
    label: 'ShareGPT messages',
    technique: 'lora-sft',
    filename: 'sharegpt-template.jsonl',
    description: 'Chat-style messages array for conversational models.',
  },
  {
    id: 'full-sft-text',
    label: 'Plain text chunks',
    technique: 'full-sft',
    filename: 'alpaca-template.jsonl',
    description: 'Use JSONL instruction pairs or plain .txt chunks for continued pre-training.',
  },
  {
    id: 'embedding-pairs',
    label: 'Embedding pairs',
    technique: 'embedding-sft',
    filename: 'embedding-pairs-template.jsonl',
    description: 'query + positive fields for retriever / embedding models.',
  },
];

export function sampleAssetUrl(sampleId: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}datasets/samples/${sampleId}.jsonl`;
}

export function templateAssetUrl(filename: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}datasets/templates/${filename}`;
}

export async function fetchSampleAsFile(sampleId: string): Promise<File> {
  const url = sampleAssetUrl(sampleId);
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load sample (${response.status})`);
  }
  const blob = await response.blob();
  return new File([blob], `${sampleId}.jsonl`, { type: 'application/jsonl' });
}

export async function downloadTemplate(filename: string): Promise<void> {
  const url = templateAssetUrl(filename);
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load template (${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export function rowsToJsonlFile(rows: Record<string, unknown>[], filename: string): File {
  const body = rows.map((row) => JSON.stringify(row)).join('\n');
  return new File([body], filename, { type: 'application/jsonl' });
}
