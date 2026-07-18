const fineTuningTechniquesContent = {
  header: 'FINE-TUNING TECHNIQUES',
  text: `Fine-tuning adapts a pretrained language model to your domain, tone, or task — without training from scratch. This page is a practical map of the main techniques you will see: full supervised fine-tuning, LoRA, QLoRA, lighter PEFT flavors, embedding fine-tunes for search, and preference methods like DPO. Use it to pick a path; open the LoRA deep dive when you are ready to implement adapters.`,
  contents: [
    {
      type: 'header',
      text: 'Why fine-tune at all?',
    },
    {
      type: 'text',
      text: `A base instruct model already knows language. It does not know your product names, support tone, internal APIs, or that answers must be JSON. Fine-tuning steers that general skill with examples: prompt → desired answer. You are not rebuilding the model — you are teaching consistent behavior on your data.`,
    },
    {
      type: 'text',
      text: `**Example:** ask a stock model “How do I reset Widget Pro?” and you may get a generic password-reset spiel. After fine-tuning on your support transcripts, replies cite your Settings path, brand voice, and links. On CPUs and small GPUs, which technique you pick matters as much as model size: full weight updates are powerful but expensive; parameter-efficient methods update only a thin slice of the network.`,
    },
    {
      type: 'header',
      text: 'Full supervised fine-tuning (SFT)',
    },
    {
      type: 'text',
      text: `Every weight in the model is updated on labeled instruction pairs (or continued pre-training on plain text). The loss is usually next-token cross-entropy: predict the assistant’s tokens given the prompt. Quality per step can be high because the whole network can move.`,
    },
    {
      type: 'text',
      text: `**Cost:** memory and runtime grow with parameter count. Training usually uses Adam (or AdamW): an optimizer that adapts the step size per weight using two running averages (momentum and variance). Those averages are stored for every trainable weight, so optimizer state often adds ~2× more memory on top of the model itself. You also ship a full model copy per task. On CPU this is usually practical only for very small models (roughly under ~360M parameters). Prefer full SFT when the base is tiny, you have strong hardware, or adapters are not moving quality enough.`,
    },
    {
      type: 'header',
      text: 'LoRA (Low-Rank Adaptation)',
    },
    {
      type: 'text',
      text: `Instead of updating all weights, LoRA freezes the base model and trains small low-rank matrices (A and B) injected into attention — often q_proj and v_proj — and sometimes MLP layers. The effective update is ΔW ≈ BA with rank r ≪ full width. You store and swap tiny adapter files, merge them for inference if you want, and keep training cost far below full SFT.`,
    },
    {
      type: 'text',
      text: `**Data:** same as SFT — instruction JSONL, chat messages, or prompt/completion text. LoRA does not need a special file format. LoRA is the default recommendation for CPU-friendly chat fine-tunes and most first product bots.`,
    },
    {
      type: 'link',
      href: '#/lora-fine-tuning',
      text: 'LoRA fine-tuning in depth (math, viz, code)',
    },
    {
      type: 'header',
      text: 'QLoRA',
    },
    {
      type: 'text',
      text: `QLoRA is LoRA with the frozen base stored in 4-bit NormalFloat (NF4). Adapters still train in higher precision (often bf16). During forward/backward, weights are dequantized for the matmul; the base is not updated. That frees GPU VRAM so larger models (paper: 65B on a 48GB GPU) can be fine-tuned on one card.`,
    },
    {
      type: 'text',
      text: `On pure CPU setups QLoRA is less common; LoRA on a small dense model is usually simpler. Reach for QLoRA when the base will not fit in fp16/bf16 on your GPU.`,
    },
    {
      type: 'header',
      text: 'Other PEFT flavors',
    },
    {
      type: 'text',
      text: `**PEFT** means parameter-efficient fine-tuning: freeze most of the model, train a small add-on. LoRA is the most common flavor. Others you will see:`,
    },
    {
      type: 'subHeader',
      text: 'DoRA',
    },
    {
      type: 'text',
      text: `Weight-Decomposed Low-Rank Adaptation splits magnitude and direction of updates. Often a drop-in alternative to LoRA with modest quality gains for similar cost. Try it if LoRA plateaus and you want a small experiment without going to full SFT.`,
    },
    {
      type: 'subHeader',
      text: 'Prefix / prompt tuning',
    },
    {
      type: 'text',
      text: `Learns soft prompt vectors prepended to inputs (or to every layer) while freezing the model. Extremely light on parameters, but usually weaker than LoRA for deep style or domain shifts. Useful when you need many tiny task heads on one frozen backbone.`,
    },
    {
      type: 'subHeader',
      text: 'Adapter layers (Houlsby-style)',
    },
    {
      type: 'text',
      text: `Inserts small bottleneck modules between transformer blocks. Conceptually similar to LoRA: freeze the backbone, train a compact add-on. LoRA is more popular in open LLM tooling today because adapters merge cleanly and PEFT defaults target attention projections.`,
    },
    {
      type: 'header',
      text: 'Embedding model fine-tuning',
    },
    {
      type: 'text',
      text: `Not a chat technique. You train a small encoder (for example MiniLM or bge-small) on query–document pairs so semantic search and RAG retrieve your domain better. Datasets look like (query, positive) or triplets with hard negatives — not Alpaca chat JSONL.`,
    },
    {
      type: 'text',
      text: `**When to use:** your chat model is fine, but retrieval keeps missing the right docs. Fine-tune embeddings first; that often helps RAG more than another chat LoRA.`,
    },
    {
      type: 'header',
      text: 'Preference / alignment methods',
    },
    {
      type: 'text',
      text: `After (or instead of) plain SFT, methods like RLHF, DPO, or ORPO optimize for preferred answers. They need preference data (chosen vs rejected replies) and more tooling. RLHF trains a reward model then optimizes with RL; DPO skips the reward model and trains directly on preferred pairs — usually simpler to run.`,
    },
    {
      type: 'text',
      text: `Most product domain bots start with LoRA SFT and only add preference training when you have clear “good vs bad” pairs and a working SFT baseline. Preference tuning without SFT often underperforms.`,
    },
    {
      type: 'header',
      text: 'How to choose quickly',
    },
    {
      type: 'code',
      code: `Goal                              Prefer
--------------------------------  -------------------------
Tiny model on CPU, first try      LoRA SFT
Sub-360M, max quality, patience   Full SFT
Large model, limited GPU VRAM     QLoRA
Custom search / RAG retrieval     Embedding fine-tune
Tone + domain chat answers        LoRA (Alpaca / chat JSONL)
Safer / preferred replies later   DPO (after SFT)
Many tiny task heads, frozen LM   Prefix / prompt tuning`,
    },
    {
      type: 'text',
      text: `**Start simple:** one clean LoRA SFT run on a model you can load. Measure answers on a held-out set of real user questions. Only then move to QLoRA (bigger base), full SFT (tiny base + max capacity), or DPO (preference data ready).`,
    },
    {
      type: 'link',
      href: '#/lora-fine-tuning',
      text: 'Deep dive: LoRA fine-tuning',
    },
    {
      type: 'link',
      href: '#/fine-tune',
      text: 'Try fine-tuning in Neurosentia',
    },
    {
      type: 'header',
      text: 'Sources',
    },
    {
      type: 'reference',
      href: 'https://arxiv.org/abs/2106.09685',
      text: 'Hu et al., 2021 — LoRA: Low-Rank Adaptation of Large Language Models',
    },
    {
      type: 'reference',
      href: 'https://arxiv.org/abs/2305.14314',
      text: 'Dettmers et al., 2023 — QLoRA: Efficient Finetuning of Quantized LLMs',
    },
    {
      type: 'reference',
      href: 'https://arxiv.org/abs/2305.18290',
      text: 'Rafailov et al., 2023 — Direct Preference Optimization (DPO)',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/docs/peft/main/en/conceptual_guides/lora',
      text: 'Hugging Face PEFT — LoRA conceptual guide',
    },
  ],
};

export default fineTuningTechniquesContent;
