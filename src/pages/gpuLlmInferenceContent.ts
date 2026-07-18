const gpuLlmInferenceContent = {
  header: 'Why GPUs run LLMs (and CPUs usually do not)',
  text: `When a chatbot answers in a second, it is not “looking up a sentence.” It is grinding through an absurd amount of matrix multiplication — the same kind of arithmetic that shows up in spreadsheets and linear algebra textbooks, just at industrial scale. GPUs win that race because they are built to do thousands of those multiplies at once. This article walks from a single typed prompt to the hardware that makes the reply possible.`,
  contents: [
    {
      type: 'header',
      text: 'The one-line answer',
    },
    {
      type: 'text',
      text: `**LLMs (large language models) spend most of their runtime multiplying large matrices.** A **CPU** (central processing unit — the general-purpose chip in a PC or server) is shaped for a few complex tasks in sequence. A **GPU** (graphics processing unit — originally for graphics, now the workhorse for AI math) is shaped for millions of simple multiply-adds in parallel. **Training** (teaching the model from data) and **inference** (running a trained model to generate answers) both live in that second world — so GPUs and cousins like **TPUs** (Google’s tensor processing units) and **NPUs** (neural processing units on phones and laptops) are the default.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  Prompt["Prompt / batch"] --> Mat["Matrix ops<br/>GEMM + attention"]
  Mat --> Out["Logits<br/>(or loss when training)"]
  CPU["CPU: few fat cores"] -.->|"wrong shape at scale"| Mat
  GPU["GPU: many thin cores"] -->|"native fit"| Mat`,
    },
    {
      type: 'text',
      text: `**GEMM** means **General Matrix Multiply** — the standard name in numerical libraries for “multiply these two matrices.” You will see it everywhere in GPU and LLM performance writing.`,
    },
    {
      type: 'header',
      text: 'From a typed prompt to a pile of numbers',
    },
    {
      type: 'text',
      text: `Start with something concrete. You type: *“Explain gravity like I’m twelve.”* The system does not store a ready-made paragraph for that string. Roughly:`,
    },
    {
      type: 'text',
      text: `**1. Tokenize —** break the text into tokens (subword pieces) and map each to an ID.`,
    },
    {
      type: 'text',
      text: `**2. Embed —** turn each ID into a vector of numbers (often hundreds or thousands of dimensions). The prompt becomes a matrix: rows = tokens, columns = features.`,
    },
    {
      type: 'text',
      text: `**3. Run the stack —** send that matrix through many **transformer** layers (the repeating building blocks of modern LLMs; often on the order of tens). Each layer mixes information with **attention** (a weighted “look at other tokens” step) and transforms it with **linear layers** (matrix multiplies against huge **weight** tables — the learned numbers that define the model).`,
    },
    {
      type: 'text',
      text: `**4. Predict the next token —** a final projection produces a **logit** (a raw score, before turning scores into probabilities) for every **token** in the vocabulary — not “every English word,” but every entry the tokenizer knows. **Argmax** picks the highest score; **sampling** draws randomly from a probability distribution. Embed that token and run it through the stack again with a **KV cache** (Key/Value cache: stored attention keys and values from earlier tokens so the prompt is not recomputed from scratch). Repeat until the answer is done.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  T["Text"] --> Tok["Tokens"]
  Tok --> Emb["Embedding"]
  Emb --> L["Transformer<br/>layers × N"]
  L --> Logits["Vocab logits"]
  Logits --> Next["Next token"]
  Next --> Emb`,
    },
    {
      type: 'text',
      text: `Almost every expensive step in that loop is the same family of work: **take a grid of numbers, multiply it by another grid, get a new grid.** Softmax (turns scores into probabilities that sum to 1) and other nonlinearities matter, but the **FLOPs** — floating-point operations, i.e. individual arithmetic steps on real numbers — are dominated by matrix multiplies.`,
    },
    {
      type: 'header',
      text: 'What one transformer layer actually does',
    },
    {
      type: 'text',
      text: `Strip the chat UI and you get repeated blocks. Inside each block:`,
    },
    {
      type: 'text',
      text: `**Linear projections —** with the usual ML layout (rows = batch/tokens), **activations** **X** (the live numbers flowing through the network) times a weight matrix **W**: **Y = X W**. Numerical libraries call this **GEMM** (General Matrix Multiply — see above). Query, key, and value projections in attention are three of these.`,
    },
    {
      type: 'text',
      text: `**Attention —** compare queries and keys (**Q Kᵀ**), scale (typically by 1/√d), **softmax**, then mix values (**… V**). Still dominated by matrix multiplies, plus that softmax.`,
    },
    {
      type: 'text',
      text: `**MLP / feed-forward —** a small multilayer network inside each transformer block: large linear layers with a nonlinearity. Older designs use two matrices; many current LLMs use a **gated** MLP (for example **SwiGLU**, a gated activation used in Llama-style models) with three: gate, up, and down. Either way, the expensive part is still GEMM.`,
    },
    {
      type: 'text',
      text: `For a **7B–70B** model (“B” = billion parameters — roughly the count of learned weights) those **W** matrices are enormous (thousands × thousands, many times over). One **forward pass** (a single trip from input to output) over a long prompt can reach on the order of **trillions** of multiply-adds (exact count depends on model size, sequence length, and batch). **Training** adds a **backward pass** (computing how to nudge weights) of comparable cost, plus **optimizer** updates.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph Layer["One transformer block"]
    X["Input X"] --> QKV["Q, K, V = X Wq / Wk / Wv"]
    QKV --> Att["Attention: softmax(QKᵀ) V"]
    Att --> O["Out = … Wo"]
    O --> FFN["FFN: X W1 → act → W2"]
  end
  FFN --> Next["Next layer"]`,
    },
    {
      type: 'header',
      text: 'Matrix multiply in the language you already know',
    },
    {
      type: 'text',
      text: `A **matrix** is a grid of numbers. Multiplying **A (m×k)** by **B (k×n)** produces **C (m×n)**. Each entry **C[i,j]** is the **dot product** of **row i of A** with **column j of B** — multiply matching pairs and add them up:`,
    },
    {
      type: 'code',
      code: `C[i, j] = sum over k of  A[i, k] * B[k, j]

# Same recipe for every (i, j).
# That independence is why GPUs crush this workload.`,
    },
    {
      type: 'text',
      text: `If C is 4096×4096 and the shared dimension is also 4096, one multiply needs about **4096³ ≈ 69 billion** multiply-add pairs. Each pair is one **FMA** (**fused multiply-add**: hardware can often do \`a × b + c\` as a single operation). Counted as separate multiplies and adds, that is about **2 × 4096³ ≈ 137 billion FLOPs**. A model does many such multiplies per token per layer. The work is not clever branching — it is **dense, regular, parallel arithmetic**.`,
    },
    {
      type: 'text',
      text: `**Spreadsheet intuition:** each output cell is “multiply these two lists and add.” A CPU tends to fill cells one-by-one (or a few at a time). A GPU hands many cells to many workers at once. Same formula; different schedule.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph GEMM["C = A × B"]
    A["Row i of A"] --> Dot["Dot product"]
    B["Column j of B"] --> Dot
    Dot --> C["C[i,j]"]
  end
  C --> P["Many (i,j) pairs<br/>can run together"]`,
    },
    {
      type: 'header',
      text: 'CPU schedule vs GPU schedule',
    },
    {
      type: 'text',
      text: `This is the hinge of the whole story. The math for one cell never changes: **row of A · column of B**. What changes is how many of those pairs are in flight.`,
    },
    {
      type: 'text',
      text: `**CPU-style thinking:** finish C[0,0], then C[1,0], then the next cell. Clear for humans; slow when there are millions of cells.`,
    },
    {
      type: 'text',
      text: `**GPU-style thinking:** assign many C[i,j] to many workers. At step **k**, each live worker multiplies the k-th entry of its A-row by the k-th entry of its B-column, then adds into its **accumulator** (a running total). Real GPU **kernels** (the small programs that run on the GPU) are more elaborate — **tiling** (cutting big matrices into blocks that fit fast on-chip memory), **warps** (groups of threads that march in lockstep, typically 32 on NVIDIA), **Tensor Cores** (special units that multiply small matrix tiles quickly) — but the idea is the same: lots of output work in flight, not one cell after another.`,
    },
    {
      type: 'viz',
      viz: 'gpu-matmul-parallel',
    },
    {
      type: 'header',
      text: 'Why CPUs struggle at LLM scale',
    },
    {
      type: 'text',
      text: `Modern CPUs are extraordinary at **latency-sensitive, branchy** work (finish one tricky task quickly, with lots of if/else): operating systems, parsing, databases, one user’s business logic. They are the wrong shape for dense GEMM at model scale.`,
    },
    {
      type: 'text',
      text: `**Few cores (tens, not thousands)** — great for complex threads, not for millions of identical FMAs (fused multiply-adds).`,
    },
    {
      type: 'text',
      text: `**Deep caches and speculation** — **cache** = small fast memory near the core; **speculation** = guessing the next instructions to stay busy. Built so one thread goes fast. GEMM wants raw **throughput** (results per second) across a working set that often will not fit neatly in cache.`,
    },
    {
      type: 'text',
      text: `**Lower memory bandwidth —** **bandwidth** = how many bytes per second you can move between memory and compute. A large-weight matmul must stream weights and activations continuously. CPU **DRAM** (the main system memory chips) is typically far slower at this than modern GPU memory: **HBM** (**High Bandwidth Memory** — stacked memory used on many datacenter GPUs) or **GDDR** (Graphics DDR — the fast memory on many consumer graphics cards).`,
    },
    {
      type: 'text',
      text: `You *can* run small models on CPU (llama.cpp and friends). Fine for demos and tiny models. For serious training, or serving a large model to many users, wall-clock time and cost per token explode: a latency machine forced to do a throughput job.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  subgraph CPU["CPU shape"]
    C1["Core"] --> T1["Deep cache"]
    C2["Core"] --> T2["Deep cache"]
    C3["… ~8–64 cores"]
  end
  subgraph GPU["GPU shape"]
    G1["SM / CU"] --> W1["Warps: 32+ threads"]
    G2["SM / CU"] --> W2["Warps"]
    G3["… thousands of threads in flight"]
  end`,
    },
    {
      type: 'text',
      text: `In that diagram, **SM** means **Streaming Multiprocessor** (NVIDIA’s name for a cluster of GPU cores); **CU** means **Compute Unit** (the AMD-style name for a similar idea).`,
    },
    {
      type: 'header',
      text: 'Why GPUs fit this math',
    },
    {
      type: 'text',
      text: `A GPU is built around **SIMT** (**Single Instruction, Multiple Threads**): one instruction stream drives many lanes, each on different data — like one conductor cueing a huge orchestra where every player plays the same note on their own sheet. That maps almost 1:1 onto “compute many independent C[i,j] (or many partial dots) at once.”`,
    },
    {
      type: 'text',
      text: `**Massive parallelism —** thousands of lightweight threads. Production GEMM libraries (**cuBLAS**, **cuDNN**, **CUTLASS**, **Triton** — NVIDIA and open tooling that implement fast matrix math) **tile** the matrices so each **thread block** owns a small output tile instead of one lonely scalar.`,
    },
    {
      type: 'text',
      text: `**High-bandwidth GPU memory —** **HBM** or **GDDR** (defined above) keeps weight tiles and activations fed. In **decode** (emitting tokens one-by-one; details below) and other **small-batch** inference, many GEMMs are **memory-bound**: the chip waits on memory reads of **W** more than on arithmetic. Long **prefill** passes (processing the whole prompt at once) can be more **compute-bound** (limited by math throughput instead).`,
    },
    {
      type: 'text',
      text: `**Tensor / matrix units —** **Tensor Cores** (and similar matrix engines on other vendors) multiply small tiles in **mixed precision** — using narrower number formats for speed and memory: **FP16** / **BF16** (16-bit floating point), **FP8** (8-bit float), **INT8** (8-bit integers), and others — in a handful of cycles. Modern LLM stacks lean on these heavily.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph Tile["Tiled GEMM on GPU"]
    A["Tile of A"] --> TC["Tensor Core / FMA array"]
    B["Tile of B"] --> TC
    TC --> C["Tile of C"]
  end
  Many["Many tiles in parallel across SMs"] --> Tile`,
    },
    {
      type: 'text',
      text: `Put simply: the GPU **parallelizes** independent dots, **reuses** loaded tiles in fast on-chip memory, and **specializes** the multiply into matrix-tile instructions. That is the hardware rhyme for “LLM = stacked GEMMs.”`,
    },
    {
      type: 'header',
      text: 'The hidden boss: memory bandwidth',
    },
    {
      type: 'text',
      text: `Beginners often imagine GPUs win only because they “calculate faster.” For LLM **inference**, the quieter truth is: **moving weights is often harder than multiplying them.**`,
    },
    {
      type: 'text',
      text: `Each linear layer must read a huge **W** from GPU memory. If the batch is small (for example one decode step for one user), you pay that read for relatively little arithmetic — the kernel becomes **memory-bound**. Raise the batch (more sequences sharing the same **W**), and the same loaded weights do more useful work — utilization climbs.`,
    },
    {
      type: 'text',
      text: `That is why serving stacks obsess over **batching** (running several requests together), **continuous batching** (adding/removing requests mid-flight so the GPU stays full), and **quantization** (store **W** in fewer bits so each byte moved from memory represents more parameters; kernels may still convert to a wider type for compute). Faster multipliers help; fatter memory pipes and smarter reuse often help more at inference time.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  W["Weights W in GPU memory"] -->|"bytes/sec limit"| Kern["GEMM kernel"]
  X["Activations"] --> Kern
  Kern --> Y["Output Y"]
  Note["Small batch: little arithmetic per byte read"] -.-> Kern`,
    },
    {
      type: 'header',
      text: 'Inference has two tempos: prefill and decode',
    },
    {
      type: 'text',
      text: `Generating a reply is not one uniform loop. It has two phases with different shapes — and that matters for how “busy” the GPU looks.`,
    },
    {
      type: 'text',
      text: `**Prefill —** process the whole prompt at once (the “read the question” phase). Many tokens in parallel → larger matmuls → often **more compute-friendly** (especially with long prompts). Attention builds keys and values for every prompt token.`,
    },
    {
      type: 'text',
      text: `**Decode —** emit one new token at a time (the “write the answer” phase). Each step runs a thinner matmul (often one new position per sequence in the batch) plus attention over a growing **KV cache**. Decode is frequently **memory-bound** and **latency-sensitive** (users feel every token’s delay).`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph Prefill["Prefill"]
    P1["All prompt tokens"] --> P2["Fat GEMMs + attention"]
    P2 --> P3["Fill KV cache"]
  end
  subgraph Decode["Decode loop"]
    D1["One new token"] --> D2["Skinny GEMMs"]
    D2 --> D3["Attend using KV cache"]
    D3 --> D4["Append K/V"]
    D4 --> D1
  end
  Prefill --> Decode`,
    },
    {
      type: 'text',
      text: `**KV cache** is why long chats eat **VRAM** (the GPU’s own memory, as opposed to ordinary system RAM): you store extra tensors that grow with sequence length, batch size, number of layers, and head dimensions. Context windows are not free — they are memory.`,
    },
    {
      type: 'header',
      text: 'Inference vs training on a GPU',
    },
    {
      type: 'text',
      text: `**Inference** — mostly forward GEMMs + attention. Memory holds weights and the KV cache. Bottlenecks: weight bandwidth, cache size, and batching.`,
    },
    {
      type: 'text',
      text: `**Training** — forward **plus** backward (**gradients**: “which way to nudge each weight”) **plus** **optimizer state** (extra numbers the trainer keeps per weight). With **Adam** (a popular optimizer), the common rule of thumb is about **two extra buffers per trained parameter** (first and second moment estimates). Mixed-precision recipes may also keep a full-precision master copy of weights, which adds more. That is why teams use multi-GPU **sharding** — splitting state across GPUs with systems like **ZeRO** or **FSDP** — plus **gradient checkpointing** (recompute some activations instead of storing them), **LoRA/QLoRA** (train small adapter matrices so far fewer parameters need optimizer state), and mixed precision.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph Infer["Inference"]
    I1["Load W"] --> I2["Forward GEMMs"]
    I2 --> I3["Sample next token"]
    I3 --> I2
  end
  subgraph Train["Training"]
    T1["Forward"] --> T2["Loss"]
    T2 --> T3["Backward / gradients"]
    T3 --> T4["Optimizer step"]
    T4 --> T1
  end`,
    },
    {
      type: 'text',
      text: `Same math family both times. Training just does more of it and keeps more intermediates alive.`,
    },
    {
      type: 'header',
      text: 'A tiny numeric picture',
    },
    {
      type: 'text',
      text: `One linear layer: **X (batch × 4096) × W (4096 × 4096)**.`,
    },
    {
      type: 'code',
      code: `# Rough FLOPs for that one matmul (mul and add counted separately):
# 2 * batch * 4096 * 4096

batch=1    → ~33.6M FLOPs
batch=32   → ~1.07B FLOPs
# × many layers × many tokens → GPU territory

# Ballpark: a dense 7B model in FP16 (16-bit floats) is ~14 GB of weights alone
# (7e9 params × 2 bytes; before KV cache, activations, fragmentation)`,
    },
    {
      type: 'text',
      text: `Peak GPU throughput depends on precision and generation — marketing slides quote from tens to thousands of **TFLOPs** (**teraflops**: trillions of floating-point operations per second). What matters in practice is sustained performance on real GEMMs, often limited by memory traffic. A CPU may claim a few TFLOPs peak on paper, but large-**W** GEMM usually hits bandwidth and core-count walls first. For the same model, **tokens/sec** on GPU vs CPU often differs by an order of magnitude or more (exact gaps vary by model, quantization, and batching).`,
    },
    {
      type: 'header',
      text: 'When CPU (or NPU) still makes sense',
    },
    {
      type: 'text',
      text: `**CPU is fine for** tiny models, offline jobs with no deadline, prototyping tokenizers and glue code, or when the only machine you have is a laptop and slow is acceptable.`,
    },
    {
      type: 'text',
      text: `**Edge NPUs** (on-device AI accelerators), **Apple GPU**, and mobile accelerators — same idea as discrete GPUs: lots of parallel multiply-adds beside the memory that holds the weights. The principle does not change; the packaging does.`,
    },
    {
      type: 'text',
      text: `**The CPU still conducts the orchestra** — HTTP servers, tokenization, batching schedulers, dataloaders. The GPU is the math engine; the CPU is the control plane.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  API["API / app CPU"] --> Tok["Tokenizer CPU"]
  Tok --> GPU["GPU kernels<br/>GEMM / attention"]
  GPU --> Detok["Detokenize CPU"]
  Detok --> API`,
    },
    {
      type: 'header',
      text: 'Takeaways',
    },
    {
      type: 'text',
      text: `**An LLM reply is stacked matrix multiplies** (plus softmax and light glue) repeated across layers and tokens.`,
    },
    {
      type: 'text',
      text: `**Each C[i,j] is still row i of A · column j of B** — GPUs simply evaluate many of those pairs at once.`,
    },
    {
      type: 'text',
      text: `**CPUs = few complex cores**; wrong shape for dense GEMM at LLM scale.`,
    },
    {
      type: 'text',
      text: `**GPUs = many simple cores + fat memory pipes + matrix units**; right shape for training and inference.`,
    },
    {
      type: 'text',
      text: `**Inference is often memory-bound in decode / small-batch serving**; batching and quantization exist to make each byte of bandwidth count.`,
    },
    {
      type: 'text',
      text: `**Prefill ≠ decode** — prompts process many tokens together; generating tokens one-by-one leans on the KV cache and is often skinnier and more bandwidth-hungry.`,
    },
    {
      type: 'text',
      text: `**Training needs even more GPU memory** than inference because of gradients and optimizer state.`,
    },
    {
      type: 'link',
      href: '#/llm-model-files',
      text: 'Next: how those weight matrices are stored on disk',
    },
    {
      type: 'link',
      href: '#/lora-fine-tuning',
      text: 'Related: LoRA — train fewer matrices on the same GPU',
    },
  ],
};

export default gpuLlmInferenceContent;
