const loraFineTuningContent = {
  header: 'LoRA fine-tuning',
  text: `Pretrained models know language in general — fine-tuning is how you teach them your job: product tone, domain vocabulary, tool formats, or how to answer your users. Without it, a base model gives generic answers; with it, the same weights behave like something you built for your use case.

The catch is cost. Updating every parameter (full fine-tuning) needs huge memory and produces a full model copy per task. Parameter-efficient methods train only a small slice of extra weights instead. This article focuses on LoRA — the most common of those — but first, a quick map of the landscape.`,
  contents: [
    {
      type: 'header',
      text: 'Why fine-tuning is required',
    },
    {
      type: 'text',
      text: `Pretraining teaches broad patterns from the internet (or a large corpus). It does not know your API docs, your brand voice, or that replies must be JSON. Fine-tuning closes that gap with supervised examples: (prompt → desired answer). You are not relearning language from scratch — you are steering an already-capable model toward consistent behavior on your data.`,
    },
    {
      type: 'header',
      text: "First, what are 'weights' and 'training'?",
    },
    {
      type: 'text',
      text: `A weight is just an adjustable number — think of a dial on a music mixer or an oven knob. A language model is millions to billions of these dials. They are stored in big rectangular tables called weight matrices (often written W). When the model “thinks,” each layer takes an input vector x and computes something like y = W x: the dials mix the input into a new vector that flows to the next layer.`,
    },
    {
      type: 'text',
      text: `Training means: show the model examples, measure how wrong its answers are (the loss), then nudge the dials so the next try is a little better. Real-world analogy: tasting a soup and adjusting salt after each spoonful. You are not rewriting the recipe from scratch — you are turning knobs.`,
    },
    {
      type: 'text',
      text: `If you know a little calculus: the “which way to turn each dial” is the gradient — the derivative of the loss with respect to that weight, ∂L/∂w. Training repeats: forward pass → loss → compute gradients → take a small step downhill (gradient descent). In one line:`,
    },
    {
      type: 'code',
      code: `w ← w − learning_rate × (∂L / ∂w)

# learning_rate is a tiny step size so you do not overshoot
# Fine-tuning = same loop, but dials start from a pretrained model
# instead of random noise`,
    },
    {
      type: 'text',
      text: `In practice almost nobody uses plain gradient descent. Trainers use an optimizer — a recipe for how big each nudge should be. Adam (Adaptive Moment Estimation) is the default in most LLM fine-tunes. Plain descent takes one fixed-size step along the gradient. Adam keeps two running averages per weight: momentum (which way the gradient has been pointing lately) and variance (how noisy or large those gradients have been). It uses those to scale the step for each dial separately — dials that keep getting a clear signal move faster; noisy ones get damped.`,
    },
    {
      type: 'text',
      text: `**The catch for memory:** Adam stores those two averages for every trainable weight. Roughly, if the model weights take X bytes, Adam’s extra state can take about another 2X. That is why people say “optimizer states often cost ~2× more memory.” LoRA helps because Adam only needs those states for the small A/B adapters — not for every base weight.`,
    },
    {
      type: 'text',
      text: `**Concrete before/after:** ask a base model “How do I reset my Widget Pro password?” and you may get a generic internet-style answer. After LoRA training on your support transcripts, the same frozen base plus small adapters answers in your product’s voice, with your reset URL and tone. Training did not rebuild the whole brain — it tuned a thin set of dials for your job.`,
    },
    {
      type: 'text',
      text: `Fine-tuning = keep that training loop, but start from an already-smart model instead of random dials. LoRA goes further: freeze almost every dial, and only train a tiny extra set of dials (A and B) that sit beside the big ones.`,
    },
    {
      type: 'header',
      text: 'Fine-tuning methods at a glance',
    },
    {
      type: 'text',
      text: `**Full SFT** updates all weights — maximum flexibility, highest RAM/VRAM and checkpoint size. Best when the base is tiny or you truly need every layer to move.`,
    },
    {
      type: 'text',
      text: `**LoRA (this article)** freezes the base and trains small low-rank adapters — default choice for instruct/chat tuning when the model fits in memory.`,
    },
    {
      type: 'text',
      text: `**QLoRA** is LoRA plus a 4-bit quantized base (a packed storage format called NF4 — details later). The adapter math is identical; only the frozen weights are stored in low precision so larger models fit on one GPU. Use it when the base is too large to load in fp16/bf16.`,
    },
    {
      type: 'text',
      text: `**Other names you will see (skimmable for now):** adapters / P-tuning / prefix tuning insert small trainable vectors while the backbone stays fixed — even lighter, often weaker for deep style shifts. Preference methods (DPO, RLHF) refine behavior after SFT using chosen vs rejected answers — useful once basic instruction tuning works. You do not need those to understand LoRA.`,
    },
    {
      type: 'text',
      text: `**Rule of thumb:** start with LoRA SFT on a base that fits your machine; move to full SFT only on small models; use QLoRA when the base is too big to load densely; add preference training only when you have comparison data and a working SFT baseline.`,
    },
    {
      type: 'link',
      href: '#/fine-tuning-techniques',
      text: 'Longer comparison of all fine-tuning techniques',
    },
    {
      type: 'header',
      text: 'Why full updates are expensive',
    },
    {
      type: 'text',
      text: `Full fine-tuning updates every parameter in every layer. For a 7B model that is billions of trainable weights — and because Adam stores momentum and variance for each of them, optimizer state alone can roughly double the memory on top of the weights — plus activations for backprop. On a laptop CPU or a single consumer GPU, that quickly becomes impossible. Even when it fits, you get a full copy of the model per task — painful to store, version, and swap. That cost gap is why LoRA exists.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  subgraph Full["Full fine-tuning"]
    W0["Pretrained W"] --> W1["Updated W"]
    W1 --> C1["Checkpoint size: entire model"]
  end
  subgraph LoRA["LoRA fine-tuning"]
    Wf["Frozen W"] --> Out["W + scaled BA"]
    A["Train A r x k"] --> Out
    B["Train B d x r"] --> Out
    Out --> C2["Checkpoint size: adapter only"]
  end`,
    },
    {
      type: 'header',
      text: 'The core idea: low-rank weight updates',
    },
    {
      type: 'text',
      text: `A linear layer in a transformer maps an input vector x (length k) to an output vector y (length d) using a weight matrix W with shape d × k:`,
    },
    {
      type: 'code',
      code: `y = W x

W has shape (d × k)
Example: d = 4096, k = 4096  →  ~16.7M parameters in one projection matrix`,
    },
    {
      type: 'text',
      text: `Full fine-tuning learns a full update matrix ΔW with the same d × k shape. LoRA instead freezes W and learns two smaller matrices A and B whose product approximates the update:`,
    },
    {
      type: 'code',
      code: `ΔW ≈ B A

A has shape (r × k)
B has shape (d × r)
r is the rank (typically 4, 8, 16, 32, 64)

Effective weight during training/inference:
W' = W + (α / r) · B A

Forward pass:
y = W x + (α / r) · B (A x)`,
    },
    {
      type: 'text',
      text: `Think of A as compressing the input into r channels, and B as expanding back to the output size. When r is much smaller than d and k, you train far fewer numbers. The original paper observes that the change induced by fine-tuning often has low intrinsic rank — the adaptation lives in a small subspace, not in all d×k directions.`,
    },
    {
      type: 'subHeader',
      text: 'Does LoRA change W or add a layer?',
    },
    {
      type: 'text',
      text: `**Short answer:** neither in the way people first imagine. During training LoRA does not rewrite the pretrained matrix W — W stays frozen. And LoRA is not a brand-new transformer block either. It is a thin side path on an existing linear layer, not an extra “layer” in the stack like another attention block.`,
    },
    {
      type: 'text',
      text: `How a token is generated (same pipeline with or without LoRA): tokens → embedding → many transformer blocks → final logits → sample/argmax the next token. LoRA does not sit after the whole model as a second funnel. Wherever you attach it (often q_proj / v_proj inside attention), the same hidden vector x goes through the frozen path and the LoRA path in parallel, then the results are added:`,
    },
    {
      type: 'code',
      code: `y = W x + (α / r) · B (A x)
#     ↑ frozen base     ↑ trainable side path
# same layer, same moment — not “base first, LoRA later”`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  Tok["Prompt tokens"] --> Emb["Token embedding"]
  Emb --> Blk["Transformer blocks"]

  subgraph Adapted["Inside one adapted linear e.g. q_proj"]
    direction TB
    X["Hidden vector x"] --> Wpath["Frozen W → Wx"]
    X --> Lpath["LoRA A → B → scaled BA x"]
    Wpath --> Add["Add"]
    Lpath --> Add
    Add --> Y["Output y"]
  end

  Blk --> Adapted
  Y --> More["Rest of the model"]
  More --> Head["lm_head → logits"]
  Head --> Next["Next token"]`,
    },
    {
      type: 'text',
      text: `So the next token is still chosen from the model’s final logits — LoRA only nudges the hidden states along the way by adding that small side path at adapted matrices.`,
    },
    {
      type: 'text',
      text: `After training you have two choices:`,
    },
    {
      type: 'text',
      text: `**Keep adapters separate —** base model unchanged; load tiny LoRA files on top (swap styles/tasks easily).`,
    },
    {
      type: 'text',
      text: `**Merge —** bake the update in: W' = W + (α / r)·BA. Then inference looks like a normal model with updated weights, and you no longer need A/B at runtime.`,
    },
    {
      type: 'text',
      text: `**Mental model:** the pretrained dials stay put; LoRA adds a small set of extra dials next to them. If you merge later, those extras get folded into the original dials so the network looks like one matrix again.`,
    },
    {
      type: 'subHeader',
      text: 'Parameter count (why the savings are real)',
    },
    {
      type: 'text',
      text: `Count the dials you actually train — that is what drives RAM, VRAM, Adam state, and checkpoint size.`,
    },
    {
      type: 'text',
      text: `**Full fine-tuning of one linear layer:** W is a d × k grid. Every cell is a trainable number, so you train d × k parameters. If the layer maps 4096 inputs to 4096 outputs, that is 4096 × 4096 = 16,777,216 ≈ 16.8 million dials for that one matrix alone.`,
    },
    {
      type: 'text',
      text: `**LoRA on the same layer:** freeze W. Train A (shape r × k) and B (shape d × r). The trainable count is:`,
    },
    {
      type: 'code',
      code: `# Full SFT (one layer):
trainable = d × k
          = 4096 × 4096
          = 16,777,216   (~16.8M)

# LoRA (same layer, rank r = 16):
trainable = (r × k) + (d × r)
          = r × (d + k)
          = 16 × (4096 + 4096)
          = 16 × 8192
          = 131,072      (~131k)

# Ratio for this matrix:
16.8M / 131k ≈ 128× fewer trainable params`,
    },
    {
      type: 'text',
      text: `**Why that formula?** A has r rows and k columns → r·k numbers. B has d rows and r columns → d·r numbers. Add them: r·k + d·r = r(d + k). The product B A still has shape d × k (same as a full ΔW), but it is built from only those ~131k free numbers. You are describing a huge update table using a skinny “bottleneck” of width r.`,
    },
    {
      type: 'text',
      text: `**Intuition:** painting a 4096×4096 wall by touching every pixel is full SFT. LoRA is closer to mixing 16 base colors (the rank channels) and spreading them — fewer knobs, still a full-size picture. Rank r is how many independent directions of change you allow. Larger r → more capacity, more trainable params; smaller r → cheaper, more constrained.`,
    },
    {
      type: 'text',
      text: `**Whole-model note:** a 7B model has many layers and many matrices (attention q/k/v/o, MLP, embeddings, norms…). Full SFT updates almost all of them. LoRA usually attaches only to a few targets — often just q_proj and v_proj, sometimes all attention projections or MLP too. Embeddings and norms typically stay frozen. So the ~128× saving on one matrix compounds across the model: trainable params drop from billions to a few million (or less), Adam only stores state for those adapters, and the checkpoint you save is a small adapter file instead of a full 7B copy.`,
    },
    {
      type: 'header',
      text: 'Where LoRA sits in a transformer block',
    },
    {
      type: 'text',
      text: `Before the technical names: inside each layer, attention is a soft lookup. Query (q) is your question, key (k) is each token’s label, value (v) is the page content you copy if the label matches, and output (o) writes that summary back into the model’s working notes. The matrices W_q, W_k, W_v, W_o are just the dials that build those four vectors from the incoming hidden state. (A fuller notebook analogy and a worked sentence sit in the interactive section below.)`,
    },
    {
      type: 'text',
      text: `Decoder-only models (Llama, Mistral, Qwen, SmolLM, etc.) repeat blocks of: RMSNorm → self-attention → residual → RMSNorm → MLP → residual. Attention projects hidden states into query, key, value, and output spaces via matrices often named q_proj, k_proj, v_proj, o_proj. The original LoRA paper (Hu et al., 2021) found adapting Wq and Wv worked best among attention-only setups; Hugging Face PEFT recipes commonly start with target_modules=["q_proj", "v_proj"]. You can also adapt all four attention projections, or MLP (gate/up/down), when you need more capacity — that is a config choice, not required.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  X["Hidden state x"] --> Q["q_proj + LoRA"]
  X --> K["k_proj frozen"]
  X --> V["v_proj + LoRA"]
  Q --> Attn["Scaled dot-product attention"]
  K --> Attn
  V --> Attn
  Attn --> O["o_proj frozen"]
  O --> Y["Attention output"]
  Y --> MLP["MLP usually frozen"]
  MLP --> Out["Block output"]

  subgraph LoRA_detail["Default recipe: adapters on q and v"]
    x2["x"] --> Aq["A r x k"]
    Aq --> Bq["B d x r"]
    Bq --> add["Add to Wx with scale alpha/r"]
  end`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph Base["Frozen base model"]
    TB["Transformer block"]
    W["Wq Wk Wv Wo"]
    TB --> W
  end
  subgraph Adapters["Trainable LoRA adapters"]
    LQ["Aq Bq"]
    LV["Av Bv"]
  end
  subgraph Disk["Checkpoint on disk"]
    CK["adapter.safetensors - few MB"]
  end
  W -->|"parallel path"| LQ
  W -->|"parallel path"| LV
  LQ --> CK
  LV --> CK`,
    },
    {
      type: 'header',
      text: 'Watch LoRA update through layers',
    },
    {
      type: 'text',
      text: `A transformer is a stack of identical blocks — like floors in a building. Tokens enter at the bottom (embeddings); each layer transforms the hidden vector and passes it up. Inside every layer, self-attention uses four dense weight matrices W_q, W_k, W_v, W_o. “Weights” here means those float tables (often shape ~d×d; e.g. d = 4096 → ~16.7M numbers each).`,
    },
    {
      type: 'text',
      text: `**Everyday picture:** looking something up in a messy notebook. Query (q) is your question (“what happens when the battery is low?”). Key (k) is the label on each page (“battery”, “price”, “color”). Value (v) is the page content you copy if the label matches. Output (o) is writing that summary back into your working notes so the next step can decide the next word.`,
    },
    {
      type: 'text',
      text: `**Math sketch (one head):** q = x W_q, k = x W_k, v = x W_v, then attention weights α = softmax(q kᵀ / √d) and mix = α v, then o-projection with W_o. You do not need to derive this to use LoRA — just know that training usually nudges those W’s (or small A/B adapters on top of them).`,
    },
    {
      type: 'text',
      text: `The schematic below expands q / k / v / o with a worked sentence example. Use Full SFT / LoRA / QLoRA tabs to compare what updates, and the − / + stepper to advance training one step at a time.`,
    },
    {
      type: 'viz',
      viz: 'layer-weights' as const,
    },
    {
      type: 'header',
      text: 'Training: what actually gets gradients',
    },
    {
      type: 'text',
      text: `Only A and B (and any other LoRA matrices you enable) receive optimizer updates. W stays frozen — no Adam states for it, which is where most of the memory win comes from. The loss is the usual next-token cross-entropy on your instruction dataset. Gradients still flow backward through the frozen base (so adapters get useful signals), but W itself is not updated. In calculus terms: you still compute ∂L/∂A and ∂L/∂B; you skip storing optimizer history for every entry of W. QLoRA is the same idea with W stored in 4-bit and dequantized on the fly for the matmul (Dettmers et al., 2023).`,
    },
    {
      type: 'diagram',
      code: `sequenceDiagram
  participant Data as "Instruction batch"
  participant Base as "Frozen base W"
  participant LoRA as "Adapters A and B"
  participant Loss as "Cross-entropy loss"
  participant Adam as Optimizer

  Data->>Base: forward with W
  Data->>LoRA: forward with A and B
  Base->>Loss: logits
  LoRA->>Loss: delta logits
  Loss->>LoRA: gradients for A and B
  Loss-->>Base: no update to W
  Note over Base: W stays frozen
  Adam->>LoRA: Adam step on A and B only`,
    },
    {
      type: 'header',
      text: 'Rank (r) and alpha (α) — the knobs that matter',
    },
    {
      type: 'subHeader',
      text: 'Rank r',
    },
    {
      type: 'text',
      text: `r is the width of the bottleneck. Larger r means a richer ΔW approximation but more parameters and more risk of overfitting on small datasets. Practical starting points: r = 8 or 16 on CPU / small models; try 32–64 only if validation loss still drops and answers are underfit. If r is too high relative to data size, the model memorizes your JSONL templates instead of learning useful behavior.`,
    },
    {
      type: 'subHeader',
      text: 'Alpha α and scaling',
    },
    {
      type: 'text',
      text: `The scale factor α/r controls how strongly the adapter perturbs the frozen layer (original LoRA / default PEFT). Many configs set α = 2r (e.g. r = 16, α = 32). PEFT also supports Rank-Stabilized LoRA (use_rslora), which scales by α/√r instead. If generations drift too far from the base personality, lower α or train fewer epochs. If the model barely changes, raise r slightly or add target modules (e.g. include k_proj and o_proj).`,
    },
    {
      type: 'code',
      code: `# Effective scale applied to the low-rank product
scale = lora_alpha / r

# Example: r=16, alpha=32 → scale=2.0
# Tweak alpha, not r, when you want stronger/weaker adapter
# influence without changing parameter count`,
    },
    {
      type: 'header',
      text: 'Code: configure LoRA with Hugging Face PEFT',
    },
    {
      type: 'text',
      text: `PEFT (Parameter-Efficient Fine-Tuning) is the standard library. You load a base model in float16 or bfloat16, wrap it with get_peft_model, and train with the usual Transformers Trainer or a custom loop.`,
    },
    {
      type: 'code',
      code: `from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
import torch

model_id = "HuggingFaceTB/SmolLM2-360M-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_id)
base = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto",
)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
    target_modules=["q_proj", "v_proj"],  # start here; add k_proj, o_proj if needed
)

model = get_peft_model(base, lora_config)
model.print_trainable_parameters()
# trainable params << 1% of total`,
    },
    {
      type: 'header',
      text: 'Code: dataset format and training step',
    },
    {
      type: 'text',
      text: `Alpaca-style JSONL is the most common format for instruction tuning: instruction, optional input, and output. The trainer learns to predict output tokens given a formatted prompt. Keep templates consistent — if every row uses the same header and role tags, the model learns structure instead of noise.`,
    },
    {
      type: 'code',
      code: `# One Alpaca row (JSONL)
{
  "instruction": "Summarize LoRA in two sentences for an engineer.",
  "input": "",
  "output": "LoRA freezes pretrained weights and trains small A,B matrices so the effective update is low-rank. You swap tiny adapter files per task instead of copying full models."
}

# Minimal formatting helper
def format_example(row):
    user = row["instruction"]
    if row.get("input"):
        user += "\\n\\n" + row["input"]
    return (
        f"### Instruction:\\n{user}\\n\\n"
        f"### Response:\\n{row['output']}"
    )`,
    },
    {
      type: 'code',
      code: `training_args = TrainingArguments(
    output_dir="./lora-smollm",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    num_train_epochs=2,
    learning_rate=2e-4,
    logging_steps=10,
    save_steps=200,
    fp16=True,
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator,
)

trainer.train()
model.save_pretrained("./lora-smollm/adapter")`,
    },
    {
      type: 'header',
      text: 'What data formats work for LoRA?',
    },
    {
      type: 'text',
      text: `LoRA does not require a special file format. It trains on tokenized text examples after your data loader formats them. JSONL is popular because it is easy to stream and inspect, but JSON, CSV, Parquet, or Hugging Face Datasets all work if you convert each row into the prompt/answer text your model should learn from.`,
    },
    {
      type: 'text',
      text: `**Common shapes:** instruction rows (instruction, optional input, output), chat rows (messages with user/assistant roles), plain completion rows (prompt, completion), and preference rows (chosen, rejected) for DPO-style tuning after basic SFT. For LoRA SFT, the important part is not the container format — it is the final rendered text and labels used for next-token prediction.`,
    },
    {
      type: 'code',
      code: `# 1) Instruction / Alpaca-style JSONL
{"instruction": "Reset a password", "input": "Product: Widget Pro", "output": "Go to Settings > Security > Reset password."}

# 2) Chat-style row (render with the model's chat template)
{
  "messages": [
    {"role": "user", "content": "How do I reset my Widget Pro password?"},
    {"role": "assistant", "content": "Open Settings > Security > Reset password."}
  ]
}

# 3) Plain prompt/completion
{"prompt": "Support reply: refund policy", "completion": "Our refund window is 30 days..."}

# 4) Preference data (usually for DPO after SFT, not classic LoRA SFT)
{"prompt": "...", "chosen": "better answer", "rejected": "worse answer"}`,
    },
    {
      type: 'text',
      text: `Keep templates consistent. Mixing Alpaca headers, ChatML tags, and raw prompt/completion strings in one run teaches the model random delimiters instead of your task. Clean, consistent examples usually beat a much larger noisy dataset.`,
    },
    {
      type: 'header',
      text: 'Can every model be fine-tuned with LoRA?',
    },
    {
      type: 'text',
      text: `Not literally every model, but most modern transformer models with dense linear layers can use LoRA. In practice, LoRA attaches to modules such as nn.Linear (and sometimes Conv2d in vision/diffusion models). For Llama-like models those modules are often named q_proj and v_proj; other architectures use names like query/value, c_attn, Wqkv, or query_key_value.`,
    },
    {
      type: 'text',
      text: `If PEFT recognizes the model family, it can often choose sensible defaults. If not, you usually pass target_modules yourself after inspecting the model's layer names. The key question is: “Which weight matrices should get adapters?” If the target module type is unsupported (for example, a classic LSTM layer without custom support), LoRA may not apply cleanly without custom work.`,
    },
    {
      type: 'text',
      text: `**Rule of thumb:** if it is an open PyTorch / Transformers model with attention Linear layers, you can almost always LoRA it. If it is a closed API model, you cannot attach LoRA yourself. If it is very small, full fine-tuning may be simpler than adding adapters.`,
    },
    {
      type: 'header',
      text: 'Inference: keep adapters separate or merge into the base',
    },
    {
      type: 'text',
      text: `At inference you can load base + adapter (flexible, easy to swap tasks) or merge adapters into W for a single dense checkpoint (simpler deployment, no PEFT runtime). merge_and_unload() bakes BA into W; use when you are done experimenting.`,
    },
    {
      type: 'code',
      code: `from peft import PeftModel

# Load adapter on top of base
base = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16)
lora_model = PeftModel.from_pretrained(base, "./lora-smollm/adapter")

# Generate with adapter active
# ...

# Optional: merge for a single-file deploy
merged = lora_model.merge_and_unload()
merged.save_pretrained("./lora-smollm-merged")`,
    },
    {
      type: 'header',
      text: 'LoRA vs QLoRA (when to use which)',
    },
    {
      type: 'text',
      text: `QLoRA keeps the frozen base in 4-bit NormalFloat (NF4) and trains LoRA adapters in higher precision (typically bf16). During the forward/backward pass, W is dequantized for the matmul; it is not updated. That slashes VRAM so large models (paper: 65B on a 48GB GPU) can be fine-tuned on one card. The adapter math is the same as LoRA. On CPU with models that already fit in RAM (roughly ≤2B in fp16), plain LoRA is simpler. Reach for QLoRA when the base is too large to load densely on your hardware.`,
    },
    {
      type: 'header',
      text: 'Practical checklist (small models / CPU-friendly runs)',
    },
    {
      type: 'text',
      text: `Pick a base you can load: SmolLM2 360M/1.7B, Qwen2.5 0.5B/1.5B, TinyLlama 1.1B. Start with r = 8–16, α = 2r, q_proj + v_proj only, 1–3 epochs, short max sequence length (512–1024), small batch with gradient accumulation. Watch validation loss — if it climbs while train loss falls, you are overfitting. A few hundred clean examples often beat tens of thousands of noisy ones at this scale.`,
    },
    {
      type: 'header',
      text: 'Common failure modes',
    },
    {
      type: 'text',
      text: `**Template drift:** mixed chat formats in one dataset teach the model random delimiters. **Catastrophic style shift:** α too high or too many epochs — the adapter shouts over the base. **Underfitting:** r too low or learning rate too small for a hard domain. **Wrong modules:** code-heavy tasks sometimes need MLP LoRA, not just attention. **Forgetting to freeze base:** if everything trains, you are doing full SFT with extra steps, not LoRA.`,
    },
    {
      type: 'header',
      text: 'Mental model to keep',
    },
    {
      type: 'text',
      text: `LoRA is matrix factorization applied to fine-tuning updates. You assume the task-specific change ΔW is approximately low-rank, represent it as BA with small r, and scale it with α/r. The base model stays your shared platform; adapters are cheap, swappable specialization layers. That is why LoRA is the default first attempt for instruction tuning on limited hardware — including the Fine tune workflow in Neurosentia.`,
    },
    {
      type: 'link',
      href: '#/fine-tuning-techniques',
      text: 'Back to all fine-tuning techniques',
    },
    {
      type: 'link',
      href: '#/fine-tune',
      text: 'Open Fine tune your LLM',
    },
    {
      type: 'header',
      text: 'Sources',
    },
    {
      type: 'text',
      text: `Claims in this article were checked against the original LoRA and QLoRA papers and Hugging Face PEFT’s LoRA guide. Prefer these when you need the authoritative definitions.`,
    },
    {
      type: 'reference',
      href: 'https://arxiv.org/abs/2106.09685',
      text: 'Hu et al., 2021 — LoRA: Low-Rank Adaptation of Large Language Models (arXiv:2106.09685)',
    },
    {
      type: 'reference',
      href: 'https://arxiv.org/abs/2305.14314',
      text: 'Dettmers et al., 2023 — QLoRA: Efficient Finetuning of Quantized LLMs (arXiv:2305.14314)',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/docs/peft/main/en/conceptual_guides/lora',
      text: 'Hugging Face PEFT — LoRA conceptual guide',
    },
  ],
};

export default loraFineTuningContent;
