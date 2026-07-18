export type FineTuneTechniqueId = 'lora-sft' | 'full-sft' | 'embedding-sft';

export type CpuFit = 'excellent' | 'good' | 'slow';

export type ModelGuidance = {
  recommendedTechnique: FineTuneTechniqueId;
  techniqueWhy: string;
  trainRamLora: string;
  trainRamFull?: string;
  inferRam: string;
  tuneWhen: string;
  inferWhen: string;
  datasetNeed: string;
};

export type FineTuneModel = {
  id: string;
  name: string;
  ollamaTag: string;
  params: string;
  hfId: string;
  diskHint: string;
  cpuFit: CpuFit;
  ramHint: string;
  notes: string;
  guidance: ModelGuidance;
  allowedTechniques: FineTuneTechniqueId[];
};

export type FineTuneTechnique = {
  id: FineTuneTechniqueId;
  label: string;
  summary: string;
  cpuNote: string;
  datasetFormat: string;
  recommended?: boolean;
};

export const FINE_TUNE_TECHNIQUES: FineTuneTechnique[] = [
  {
    id: 'lora-sft',
    label: 'LoRA instruction tuning',
    summary: 'Train small adapter weights on top of a frozen base model. Best balance of quality and CPU cost.',
    cpuNote: 'Recommended default on CPU. Use Hugging Face PEFT or llama.cpp LoRA fine-tune.',
    datasetFormat: 'JSONL with instruction / input / output (Alpaca or ShareGPT style).',
    recommended: true,
  },
  {
    id: 'full-sft',
    label: 'Full supervised fine-tuning',
    summary: 'Update all model weights. Highest quality per step but very slow and memory-heavy.',
    cpuNote: 'Only practical below ~360M parameters on CPU. Expect long runtimes.',
    datasetFormat: 'JSONL instruction pairs or plain text chunks for continued pre-training.',
  },
  {
    id: 'embedding-sft',
    label: 'Embedding model fine-tuning',
    summary: 'Fine-tune a small encoder for search and RAG — not a chat model.',
    cpuNote: 'Excellent on CPU via sentence-transformers. Great for custom document retrieval.',
    datasetFormat: 'CSV/JSONL with text pairs (query, positive) or (anchor, positive, negative).',
  },
];

export const CPU_FINE_TUNE_MODELS: FineTuneModel[] = [
  {
    id: 'smollm2-135m',
    name: 'SmolLM2 135M Instruct',
    ollamaTag: 'smollm2:135m',
    params: '135M',
    hfId: 'HuggingFaceTB/SmolLM2-135M-Instruct',
    diskHint: '~270 MB',
    cpuFit: 'excellent',
    ramHint: '~1 GB',
    notes: 'Easiest tiny model. LoRA or full SFT on CPU. Best starting point for experiments.',
    guidance: {
      recommendedTechnique: 'lora-sft',
      techniqueWhy: 'LoRA is fastest for iteration; full SFT only if you have a very small, focused dataset and want every weight to shift.',
      trainRamLora: '~1–2 GB',
      trainRamFull: '~2 GB',
      inferRam: '~0.5–1 GB after merge or with adapter',
      tuneWhen: 'Custom micro-QA, tone fixes, or domain jargon on a laptop with limited RAM.',
      inferWhen: 'Generic chat, pipeline smoke tests, or the smallest possible footprint.',
      datasetNeed: '200–2,000 Alpaca-style rows (instruction / input / output). Small sets work; keep examples consistent.',
    },
    allowedTechniques: ['lora-sft', 'full-sft'],
  },
  {
    id: 'smollm-135m',
    name: 'SmolLM 135M',
    ollamaTag: 'smollm:135m',
    params: '135M',
    hfId: 'HuggingFaceTB/SmolLM-135M-Instruct',
    diskHint: '~90 MB',
    cpuFit: 'excellent',
    ramHint: '~1 GB',
    notes: 'Smallest Ollama chat model. LoRA or full SFT; fast CPU iterations.',
    guidance: {
      recommendedTechnique: 'lora-sft',
      techniqueWhy: 'LoRA trains in minutes on CPU; full SFT is viable here because the base is tiny.',
      trainRamLora: '~1–1.5 GB',
      trainRamFull: '~1.5–2 GB',
      inferRam: '~0.4–0.8 GB',
      tuneWhen: 'Ultra-light bots, offline demos, or when every megabyte on disk matters.',
      inferWhen: 'Quick prototypes where base instruct quality is enough and you will not specialize heavily.',
      datasetNeed: '100–1,500 short instruction pairs. Prefer crisp Q&A over long documents.',
    },
    allowedTechniques: ['lora-sft', 'full-sft'],
  },
  {
    id: 'smollm2-360m',
    name: 'SmolLM2 360M Instruct',
    ollamaTag: 'smollm2:360m',
    params: '360M',
    hfId: 'HuggingFaceTB/SmolLM2-360M-Instruct',
    diskHint: '~730 MB',
    cpuFit: 'excellent',
    ramHint: '~2 GB',
    notes: 'Best quality under 1 GB on disk. LoRA or full SFT; recommended default.',
    guidance: {
      recommendedTechnique: 'lora-sft',
      techniqueWhy: 'Best sweet spot under 1 GB on disk — LoRA for speed, full SFT if you can spare ~3 GB RAM and longer runs.',
      trainRamLora: '~2–3 GB',
      trainRamFull: '~3–4 GB',
      inferRam: '~1–1.5 GB',
      tuneWhen: 'Product FAQs, support snippets, or domain Q&A where you want better answers than 135M models.',
      inferWhen: 'English instruct chat out of the box; skip tuning if prompts are general and undemanding.',
      datasetNeed: '500–5,000 JSONL rows mixing general chat plus your domain examples. Quality beats raw volume.',
    },
    allowedTechniques: ['lora-sft', 'full-sft'],
  },
  {
    id: 'tinyllama',
    name: 'TinyLlama 1.1B Chat',
    ollamaTag: 'tinyllama',
    params: '1.1B',
    hfId: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    diskHint: '~640 MB',
    cpuFit: 'good',
    ramHint: '~3 GB',
    notes: 'Most tutorials for CPU LoRA. Use LoRA only on CPU.',
    guidance: {
      recommendedTechnique: 'lora-sft',
      techniqueWhy: 'Full SFT is impractical on CPU at 1.1B — LoRA is the only realistic path and has the most community recipes.',
      trainRamLora: '~3–5 GB',
      inferRam: '~1.5–2 GB',
      tuneWhen: 'Llama-format adapters, role-play personas, or when you need a well-documented CPU LoRA workflow.',
      inferWhen: 'Casual chat or coding hints without deep customization — base TinyLlama is already a solid small baseline.',
      datasetNeed: '1,000+ ShareGPT or Alpaca JSONL rows. Avoid very small sets; this size overfits easily.',
    },
    allowedTechniques: ['lora-sft'],
  },
  {
    id: 'qwen25-0.5b',
    name: 'Qwen2.5 0.5B Instruct',
    ollamaTag: 'qwen2.5:0.5b',
    params: '0.5B',
    hfId: 'Qwen/Qwen2.5-0.5B-Instruct',
    diskHint: '~400 MB',
    cpuFit: 'excellent',
    ramHint: '~2 GB',
    notes: 'Multilingual tiny instruct model. LoRA recommended on CPU.',
    guidance: {
      recommendedTechnique: 'lora-sft',
      techniqueWhy: 'LoRA handles multilingual and light code tasks well; full SFT possible but slower with modest gains on CPU.',
      trainRamLora: '~2–3 GB',
      trainRamFull: '~3–4 GB',
      inferRam: '~1 GB',
      tuneWhen: 'Non-English support, bilingual assistants, or light structured-output behavior in your target languages.',
      inferWhen: 'Multilingual chat with only light prompt engineering — Qwen2.5 0.5B is strong for its size.',
      datasetNeed: '500–3,000 rows with examples in every language or format you care about (instruction / input / output).',
    },
    allowedTechniques: ['lora-sft', 'full-sft'],
  },
  {
    id: 'qwen25-1.5b',
    name: 'Qwen2.5 1.5B Instruct',
    ollamaTag: 'qwen2.5:1.5b',
    params: '1.5B',
    hfId: 'Qwen/Qwen2.5-1.5B-Instruct',
    diskHint: '~990 MB',
    cpuFit: 'good',
    ramHint: '~4 GB',
    notes: 'Near 1 GB file size; better answers. LoRA only on CPU.',
    guidance: {
      recommendedTechnique: 'lora-sft',
      techniqueWhy: 'At 1.5B on CPU, LoRA is the practical choice — better quality per step than smaller models without full-weight training.',
      trainRamLora: '~4–6 GB',
      inferRam: '~1.5–2 GB',
      tuneWhen: 'Niche tone, compliance wording, or domain answers when sub-1B models feel too shallow.',
      inferWhen: 'General instruct use — tune only when you need repeatable domain behavior, not for one-off prompts.',
      datasetNeed: '2,000–10,000 high-quality instruction pairs. This size benefits from more diverse, clean examples.',
    },
    allowedTechniques: ['lora-sft'],
  },
  {
    id: 'minilm-l6',
    name: 'all-MiniLM-L6-v2',
    ollamaTag: '—',
    params: '22M',
    hfId: 'sentence-transformers/all-MiniLM-L6-v2',
    diskHint: '~90 MB',
    cpuFit: 'excellent',
    ramHint: '<1 GB',
    notes: 'Embedding model for semantic search — not generative chat.',
    guidance: {
      recommendedTechnique: 'embedding-sft',
      techniqueWhy: 'Not a chat model — train with sentence-transformers on similarity pairs, not instruction tuning.',
      trainRamLora: '<1 GB',
      inferRam: '<0.5 GB',
      tuneWhen: 'Custom semantic search, deduplication, or RAG retrieval over your own document corpus.',
      inferWhen: 'Generic similarity or off-the-shelf search — no generation or chat expected.',
      datasetNeed: 'CSV/JSONL with (query, positive passage) pairs or (anchor, positive, negative) triplets from your domain.',
    },
    allowedTechniques: ['embedding-sft'],
  },
  {
    id: 'bge-small',
    name: 'bge-small-en-v1.5',
    ollamaTag: '—',
    params: '33M',
    hfId: 'BAAI/bge-small-en-v1.5',
    diskHint: '~130 MB',
    cpuFit: 'excellent',
    ramHint: '<1 GB',
    notes: 'Strong small English retriever. Ideal CPU embedding fine-tune.',
    guidance: {
      recommendedTechnique: 'embedding-sft',
      techniqueWhy: 'Embedding fine-tune only — optimized for English retrieval, not text generation.',
      trainRamLora: '<1 GB',
      inferRam: '<0.5 GB',
      tuneWhen: 'English-only RAG, help-center search, or ranking snippets from internal wikis.',
      inferWhen: 'Broad English semantic match without domain-specific vocabulary or layout.',
      datasetNeed: 'Query–document pairs from real user searches or FAQs; include hard negatives when possible.',
    },
    allowedTechniques: ['embedding-sft'],
  },
];

export function cpuFitLabel(fit: CpuFit): string {
  if (fit === 'excellent') return 'CPU friendly';
  if (fit === 'good') return 'CPU LoRA';
  return 'CPU slow';
}

export function techniqueLabel(id: FineTuneTechniqueId): string {
  return FINE_TUNE_TECHNIQUES.find((t) => t.id === id)?.label ?? id;
}

export function modelSizeSummary(model: FineTuneModel): string {
  if (model.ollamaTag !== '—') {
    return `Download with ollama pull ${model.ollamaTag}`;
  }
  return `Hugging Face weights: ${model.hfId}`;
}

export function modelSizeLabel(model: FineTuneModel): string {
  return `${model.params} parameters · ${model.diskHint} on disk`;
}

export function tuneRamForTechnique(
  model: FineTuneModel,
  technique: FineTuneTechniqueId,
): string {
  const { guidance } = model;
  if (technique === 'full-sft' && guidance.trainRamFull) return guidance.trainRamFull;
  if (technique === 'embedding-sft') return guidance.trainRamLora;
  return guidance.trainRamLora;
}

export function tuneRamSummary(model: FineTuneModel): string {
  const { guidance } = model;
  if (guidance.trainRamFull) {
    return `${guidance.trainRamLora} (LoRA) · ${guidance.trainRamFull} (full SFT)`;
  }
  return `${guidance.trainRamLora} (LoRA)`;
}

/** Output formats supported by the Build data tab / ingest API. */
export type OptimalDatasetFormat = 'alpaca' | 'sharegpt' | 'embedding';

export type OptimalDatasetPreset = {
  format: OptimalDatasetFormat;
  formatLabel: string;
  maxPairs: number;
  reason: string;
};

const FORMAT_LABELS: Record<OptimalDatasetFormat, string> = {
  alpaca: 'Alpaca (instruction / input / output)',
  sharegpt: 'ShareGPT (messages)',
  embedding: 'Embedding (query / positive)',
};

/**
 * Picks build-tab format + starter pair count matched to the selected model / technique.
 */
export function optimalDatasetPreset(
  model: FineTuneModel,
  technique: FineTuneTechniqueId,
): OptimalDatasetPreset {
  const isEmbeddingOnly = technique === 'embedding-sft'
    || (
      model.allowedTechniques.includes('embedding-sft')
      && !model.allowedTechniques.some((t) => t === 'lora-sft' || t === 'full-sft')
    );

  if (isEmbeddingOnly) {
    return {
      format: 'embedding',
      formatLabel: FORMAT_LABELS.embedding,
      maxPairs: 40,
      reason: 'Embedding models need query / positive pairs, not chat instructions.',
    };
  }

  // TinyLlama has the most ShareGPT / chat-template tutorials.
  if (model.id === 'tinyllama') {
    return {
      format: 'sharegpt',
      formatLabel: FORMAT_LABELS.sharegpt,
      maxPairs: 80,
      reason: 'ShareGPT messages match Llama-style chat templates used by TinyLlama LoRA recipes.',
    };
  }

  // Smaller models: Alpaca, modest pair count to avoid overfitting.
  if (model.params.endsWith('M') || model.params === '0.5B') {
    const maxPairs = model.params === '360M' || model.params === '0.5B' ? 50 : 30;
    return {
      format: 'alpaca',
      formatLabel: FORMAT_LABELS.alpaca,
      maxPairs,
      reason: 'Alpaca JSONL is the most common format for small instruct models on CPU LoRA / full SFT.',
    };
  }

  // Larger chat models benefit from more diverse Alpaca pairs.
  return {
    format: 'alpaca',
    formatLabel: FORMAT_LABELS.alpaca,
    maxPairs: 80,
    reason: 'Alpaca instruction pairs scale well for 1B+ instruct models with LoRA.',
  };
}
