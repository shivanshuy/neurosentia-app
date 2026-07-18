const llmQuantizationContent = {
  header: 'LLM quantization: smaller weights, same brain (almost)',
  text: `You find a brilliant open model. You click download. Then the progress bar tells a cruel joke: one hundred and forty gigabytes — just for the weights. Your GPU does not have that. Quantization is the plot twist that makes the story continue: keep the architecture, shrink every number, and fight to keep the intelligence.`,
  contents: [
    {
      type: 'header',
      text: 'Cold open: the model that will not fit',
    },
    {
      type: 'text',
      text: `A **70B** model in **FP16** (**16-bit floating point**) needs about **2 bytes × 70 billion parameters ≈ 140 GB** of weights alone. That is before the **KV cache** (saved attention keys and values for the chat so far) and before activations. Most laptops — and many datacenter GPUs — simply cannot hold it.`,
    },
    {
      type: 'text',
      text: `So the industry asks a sharper question than “which architecture?” It asks: **how few bits can each weight use before the model stops sounding like itself?**`,
    },
    {
      type: 'viz',
      viz: 'quant-story-path',
    },
    {
      type: 'header',
      text: 'The trick: fewer clicks on the volume knob',
    },
    {
      type: 'text',
      text: `Think of each weight as a volume knob. **FP16** is a fine knob — tens of thousands of possible levels. **INT8** (**8-bit integer**) has **256** clicks. **INT4** has **16**. The song can still play. Quiet passages get crunchy if you are careless.`,
    },
    {
      type: 'text',
      text: `**Quantization** maps a real number to a small code, then maps it back when you compute. The usual recipe is **affine quantization**:`,
    },
    {
      type: 'code',
      code: `# real value ≈ scale × (integer_code − zero_point)

q     = round(x / scale + zero_point)   # pack (encode)
x_hat = scale * (q - zero_point)        # unpack (dequantize)`,
    },
    {
      type: 'text',
      text: `**Scale** stretches the tiny integer grid across the range of values you care about. **Zero-point** (when used) shifts the grid so real zero stays exact — handy for **activations** (the live numbers flowing through the net). Some schemes are **symmetric** (zero fixed); others are **asymmetric**.`,
    },
    {
      type: 'viz',
      viz: 'quant-bit-width',
    },
    {
      type: 'text',
      text: `Why bother? Because **inference** is often limited by **VRAM** (GPU memory) and **memory bandwidth** (bytes/sec from memory to math units) — not by how pretty the architecture diagram looks. Smaller weights → more model fits, and each byte moved carries more parameters.`,
    },
    {
      type: 'header',
      text: 'Three characters in the cast',
    },
    {
      type: 'text',
      text: `When someone says “we quantized the model,” ask: *which tensors?*`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph Cast["What people quantize"]
    W["Weights W<br/>on disk · GPTQ / AWQ / GGUF"]
    X["Activations X<br/>live batch · SmoothQuant / W8A8"]
    KV["KV cache<br/>long chats · decode VRAM"]
  end`,
    },
    {
      type: 'text',
      text: `**Weights** — the learned parameters. Shrink the checkpoint; cut traffic when loading **W** into matmuls. This is what most GGUF / GPTQ / AWQ cards advertise.`,
    },
    {
      type: 'text',
      text: `**Activations** — numbers for *this* batch. Needed for true **INT8** compute paths. Rare huge **outliers** are the villain — one giant value forces a huge scale and crushes everyone else.`,
    },
    {
      type: 'text',
      text: `**KV cache** — grows with conversation length. Quantizing it saves VRAM during **decode** (token-by-token generation), but errors can compound over long chats.`,
    },
    {
      type: 'header',
      text: 'How fine is your measuring stick?',
    },
    {
      type: 'text',
      text: `One scale for the whole matrix is like one thermostat for a skyscraper. **Per-channel** gives each output channel its own scale — standard for INT8 weights. **Per-group / block-wise** (groups of 32, 64, 128…) is why **INT4** often works at all. More metadata, better fit.`,
    },
    {
      type: 'viz',
      viz: 'quant-granularity',
    },
    {
      type: 'text',
      text: `**In practice:** INT8 → start per-channel. INT4 → expect group/block methods (GPTQ, AWQ, GGUF K-quants). Smaller groups ≈ better quality, larger files. Measure both language metrics and real tasks.`,
    },
    {
      type: 'header',
      text: 'Two paths: PTQ vs QAT',
    },
    {
      type: 'text',
      text: `**PTQ** (**Post-Training Quantization**) — take a finished model, calibrate on a small dataset, pack the weights. Hours to days. How most local GGUF and many GPTQ/AWQ models are born.`,
    },
    {
      type: 'text',
      text: `**QAT** (**Quantization-Aware Training**) — train (or fine-tune) while pretending weights are already low-bit, so the model *learns* to survive rounding. Slower. Reaches quality PTQ cannot when INT4 is brutal or SLAs are tight.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  Done["Trained FP16/BF16"] --> PTQ["PTQ<br/>calibrate + pack"]
  Done --> QAT["QAT<br/>train with fake-quant"]
  PTQ --> Fast["Ship this week"]
  QAT --> Hard["Recover hard cases"]`,
    },
    {
      type: 'text',
      text: `**Rule of thumb:** try PTQ first. Escalate to QAT (or adapters on a quantized base) only when evals fail and the serving win is worth the training cost.`,
    },
    {
      type: 'header',
      text: 'Four names on the whiteboard',
    },
    {
      type: 'text',
      text: `Infrastructure interviews love these. Here they are as characters, not alphabet soup.`,
    },
    {
      type: 'subHeader',
      text: 'GPTQ — careful INT4 packing',
    },
    {
      type: 'text',
      text: `**GPTQ** uses calibration data and a second-order (Hessian-style) estimate to round **weights** layer by layer with low reconstruction error. Weight-only INT4 for GPUs that dequant on the fly. Trade-off: heavier calibration; quality follows the calibration set.`,
    },
    {
      type: 'subHeader',
      text: 'AWQ — protect what activations hit hard',
    },
    {
      type: 'text',
      text: `**AWQ** (**Activation-aware Weight Quantization**) notices that weights multiplying large activations matter more. It protects those **salient** weights before INT4. Often excellent practical quality. Still mostly a weight story.`,
    },
    {
      type: 'subHeader',
      text: 'SmoothQuant — tame activation outliers',
    },
    {
      type: 'text',
      text: `**SmoothQuant** wants **W8A8** (8-bit weights *and* activations). It mathematically migrates difficulty from activations into weights — activations become easier to quantize; weights take a bit more heat (but weights are static). Trade-off: INT8 compute path, not the ultra-low INT4 hero.`,
    },
    {
      type: 'subHeader',
      text: 'FP8 — float, not int',
    },
    {
      type: 'text',
      text: `**FP8** is **8-bit floating point** (flavors like E4M3 / E5M2). Tiny exponent → better dynamic range than INT8 for some tensors. Shines when **H100**-class **Tensor Cores** already accelerate FP8. Trade-off: hardware- and stack-specific.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  GPTQ["GPTQ<br/>INT4 weights"] --> Serve["GPU serve"]
  AWQ["AWQ<br/>protect salient W"] --> Serve
  SQ["SmoothQuant<br/>W8A8"] --> INT8["INT8 GEMM"]
  FP8["FP8"] --> H100["H100-class TC"]`,
    },
    {
      type: 'header',
      text: 'Plot twists: when quality drops',
    },
    {
      type: 'subHeader',
      text: 'Some layers bruise easily',
    },
    {
      type: 'text',
      text: `Embeddings, final **LM head**, attention projections, and anything with heavy-tailed outliers often hate aggressive INT4. **MoE routers** (Mixture-of-Experts gate scores) can flip experts after tiny noise. Fix with mixed precision (keep sensitive layers richer), finer groups, or AWQ-style protection.`,
    },
    {
      type: 'subHeader',
      text: 'INT4 went dumb — a triage',
    },
    {
      type: 'text',
      text: `Check packing and kernels first. Ablate layer-by-layer back to FP16 to find cliffs. Inspect activation histograms for outliers. Recalibrate on *your* domain (code vs chat vs wiki). Run **behavioral** tests — JSON tools, multi-step reasoning — not only **perplexity (PPL)**. Watch long decode: KV-cache quant bugs appear late.`,
    },
    {
      type: 'subHeader',
      text: 'Beyond perplexity',
    },
    {
      type: 'text',
      text: `PPL is a cheap language score. Also track task suites you care about, structured-output exact match, tool-call success, RAG faithfulness, long-context needles, pairwise win rates — plus **latency**, **tokens/s**, **VRAM**, and **$/1M tokens**. Ship a dashboard.`,
    },
    {
      type: 'subHeader',
      text: 'MoE is not dense',
    },
    {
      type: 'text',
      text: `**MoE** routes each token to a few expert FFNs. Calibrate so rare experts get hit. Keep routers higher precision. Use per-expert scales. Measure load balance after quantization — silent expert collapse is a real failure mode.`,
    },
    {
      type: 'subHeader',
      text: 'KV cache: the long-chat tax',
    },
    {
      type: 'text',
      text: `KV grows with layers × heads × sequence × batch. Quantize it to reclaim VRAM; mitigate with per-head scales, mixed precision for recent tokens, and long-context evals. Fuse into attention kernels or you pay conversion tax.`,
    },
    {
      type: 'header',
      text: 'Where bits meet silicon',
    },
    {
      type: 'text',
      text: `A format only wins if hardware eats it quickly.`,
    },
    {
      type: 'text',
      text: `**H100** — FP8 Tensor Cores; INT8; INT4 via specialized weight kernels (GPTQ/AWQ-style). Match dtype to the fast path (TensorRT-LLM, vLLM, Transformer Engine).`,
    },
    {
      type: 'text',
      text: `**TPU** — layouts and dtypes XLA likes; not a drop-in from NVIDIA land.`,
    },
    {
      type: 'text',
      text: `**FPGA / custom ASIC** — you design the datapath. Huge upside at volume; brutal if formats change weekly.`,
    },
    {
      type: 'text',
      text: `**FlashAttention** and **fused kernels** cut memory traffic. Naive “dequant → FP16 attention → quant” can erase the win. Fuse dequant with GEMM or use native low-precision attention when you can.`,
    },
    {
      type: 'text',
      text: `**Profile end-to-end:** time-to-first-token, inter-token latency, tokens/s at real batch, VRAM, bandwidth, kernel splits. If VRAM fell but speed did not rise, you may be stuck on slow dequant, CPU overhead, or tiny batches.`,
    },
    {
      type: 'header',
      text: 'GGUF: the file that made local LLMs click',
    },
    {
      type: 'text',
      text: `**GGUF** (**GPT-Generated Unified Format**) is a **binary** file format for storing and loading LLMs — configuration, **tokenizer vocabulary**, and **tensors** in one place. It was introduced by the **llama.cpp** team (led by **Georgi Gerganov / @ggerganov**) on **August 21, 2023**, as the successor to **GGML**, which llama.cpp no longer supports.`,
    },
    {
      type: 'text',
      text: `It powers much of local chat today (**llama.cpp**, **Ollama**, and compatible runtimes). Designed to be fast on **consumer machines**: run **CPU-only**, or **partially / fully offload** layers to a GPU.`,
    },
    {
      type: 'subHeader',
      text: 'GGUF vs GGML — related, not identical',
    },
    {
      type: 'text',
      text: `Same *idea* (quantized weights for local inference), **not** the same format. **GGML** was the earlier effort; **GGUF** replaced it with richer, extensible metadata so one file can describe **many architectures**, carry **prompt templates**, and stay easier to load without a pile of side files. Think “GGUF = next-generation container,” not “renamed GGML.”`,
    },
    {
      type: 'text',
      text: `**Why it was needed:** Hugging Face repos are great for training — many **Safetensors** shards, config, tokenizer JSON. Awkward for “one download, mmap, chat on a laptop.” Local runtimes needed one **portable** artifact with **metadata** (architecture, tokenizer, quant type, templates), **mmap-friendly** layout (OS maps the file; not everything must enter RAM), and **block quantization** tuned for those backends.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph File["One GGUF file"]
    H["Header"] --> Meta["KV metadata<br/>arch · tokenizer · templates"]
    Meta --> Dir["Tensor directory"]
    Dir --> Pack["Packed blocks<br/>Q4_K / Q5_K / Q8_0…"]
  end
  Pack --> Run["CPU and/or GPU<br/>llama.cpp · Ollama · friends"]`,
    },
    {
      type: 'text',
      text: `Inside: magic + version, key-value metadata, tensor directory (names, shapes, quant types, offsets), then packed payloads. Names like **Q4_K_M**, **Q5_K_S**, **Q8_0** encode different size/quality recipes. Same “Q4” label across tools is *not* always the same math — read the card.`,
    },
    {
      type: 'code',
      code: `# Mental model
# GGUF = metadata + index + packed blocks
#
# Q4_K_M  → aggressive size, solid everyday chat (often)
# Q5_K_M  → more bits, usually nicer quality
# Q8_0    → nearer FP16, still smaller than FP16
#
# Always verify on YOUR prompts.`,
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/docs/hub/en/gguf',
      text: 'Hugging Face Hub docs: GGUF',
    },
    {
      type: 'header',
      text: 'Shipping without silent regressions',
    },
    {
      type: 'text',
      text: `Treat quantized variants like production binaries. Gate on a fixed suite (PPL + tasks + behavior + long context). Shadow a sample of prod traffic. Canary brittle prompts (JSON schemas, multilingual, code). Version calibration set + tool commit + group size. Rollback if tool-success or win-rate slips.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  Cand["Quant candidate"] --> Eval["Offline suite"]
  Eval --> Shadow["Shadow sample"]
  Shadow --> Gate{"Pass?"}
  Gate -->|yes| Serve["Serve"]
  Gate -->|no| Stop["Block"]`,
    },
    {
      type: 'text',
      text: `**Serving many variants:** separate model IDs (bits, method, group size), route by cost tier or GPU SKU, share tokenizer, warm pools per pack, tag every metric by variant.`,
    },
    {
      type: 'text',
      text: `**FP8 vs INT8 vs INT4:** pick what your accelerator already accelerates, then reclaim quality with calibration — not the reverse. FP8 when Hopper-class FP8 is the fast path; INT8 for broad W8A8; INT4 weights when VRAM/bandwidth is the wall and activations can stay richer.`,
    },
    {
      type: 'header',
      text: 'What is still unsolved',
    },
    {
      type: 'text',
      text: `Stable **sub-4-bit** without task collapse. KV quant that survives **100k+** context. MoE + quant at fleet scale. End-to-end low-precision training without subtle divergence. Hardware-software co-design so new dtypes are not stranded. Evals that catch reasoning/tool regressions PPL misses. Making ultra-low-bit models as boring and reliable as JPEG became for photos.`,
    },
    {
      type: 'header',
      text: 'Takeaways',
    },
    {
      type: 'text',
      text: `**Quantization is how LLMs fit** — fewer bits per number, scales to reconstruct, architecture intact.`,
    },
    {
      type: 'text',
      text: `**PTQ ships fast; QAT recovers hard cases.**`,
    },
    {
      type: 'text',
      text: `**GPTQ / AWQ** for INT4 weights; **SmoothQuant** for W8A8; **FP8** when the chip’s FP8 path is real.`,
    },
    {
      type: 'text',
      text: `**Group scales** are why INT4 works; **sensitive layers** and **KV** are where stories go wrong.`,
    },
    {
      type: 'text',
      text: `**GGUF** made local quantized models a one-file, mmap-friendly product — config, tokenizer, and tensors together, CPU and/or GPU.`,
    },
    {
      type: 'text',
      text: `**Measure the whole movie** — tokens/s, VRAM, and behavior — not one still frame of perplexity.`,
    },
    {
      type: 'link',
      href: '#/gpu-llm-inference',
      text: 'Related: why GPUs and memory bandwidth dominate inference',
    },
    {
      type: 'link',
      href: '#/llm-model-files',
      text: 'Related: Safetensors & full-precision model files',
    },
    {
      type: 'link',
      href: '#/lora-fine-tuning',
      text: 'Related: LoRA / QLoRA on quantized bases',
    },
  ],
};

export default llmQuantizationContent;
