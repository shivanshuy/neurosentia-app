const llamaCppContent = {
  header: 'llama.cpp: the engine that put LLMs on your laptop',
  text: `March 2023. Meta drops LLaMA weights into the open. Most machines cannot run them. Then a C/C++ engine appears: quantize, mmap, SIMD, optional GPU layers — tokens on a laptop. This piece covers why llama.cpp had to exist, how it is built, how to install it on Windows and Linux, how it differs from Ollama, and how Hugging Face + GGUF fit the picture.`,
  contents: [
    {
      type: 'header',
      text: 'Cold open: the weights that would not run',
    },
    {
      type: 'text',
      text: `Imagine you finally have the **weights** — the learned numbers that *are* the model. You also have a laptop. Between those two facts sits a wall: **PyTorch**, **CUDA**, dozens of gigabytes of FP16 tensors, and a stack that assumes a datacenter GPU.`,
    },
    {
      type: 'text',
      text: `In early 2023 that wall was not theoretical. Meta’s **LLaMA** paper and weights lit a fuse. People wanted to *chat with the model on their own silicon*. Training frameworks are magnificent for training. They are heavy for **inference** — the act of turning a prompt into the next token, again and again.`,
    },
    {
      type: 'text',
      text: `Someone had to ask a different question: **what if the entire forward pass lived in a small native binary?** No Python GIL. No half-gigabyte runtime. Just memory, SIMD, and careful math.`,
    },
    {
      type: 'viz',
      viz: 'llama-cpp-need',
    },
    {
      type: 'header',
      text: 'Who built it (and what came before)',
    },
    {
      type: 'text',
      text: `**Georgi Gerganov** (@ggerganov), a software engineer from Bulgaria, created **llama.cpp**. First public release: **March 10, 2023**. License: **MIT**. The project now lives under the **ggml-org** umbrella with a large community — but the DNA is still his.`,
    },
    {
      type: 'text',
      text: `The prequel matters. In **September 2022** he started **ggml** — a C tensor library aimed at strict memory control and multi-threading, inspired in part by Fabrice Bellard’s **LibNC**. Around the same era he shipped **whisper.cpp**: speech-to-text inference in the same minimalist spirit. llama.cpp is that philosophy applied to Meta’s transformer.`,
    },
    {
      type: 'text',
      text: `The manifesto is blunt (see the project’s early GitHub discussion “**ggml** manifesto”): make ML inference **boring to deploy** — compile, load a file, run. That attitude is why **Ollama**, **LM Studio**, **GPT4All**, and many local apps sit on this class of engine (GGUF + ggml math) even when you never type \`llama-cli\`.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  G["Georgi Gerganov"] --> GGML["ggml<br/>tensor + graph lib"]
  GGML --> W["whisper.cpp"]
  GGML --> L["llama.cpp"]
  L --> Eco["Ollama · LM Studio · GPT4All · …"]`,
    },
    {
      type: 'header',
      text: 'What it is (one sentence, then the real one)',
    },
    {
      type: 'text',
      text: `**Name check:** **llama.cpp = Llama + .cpp.** The first half is Meta’s **LLaMA** model family; the second is “this is a C/C++ program,” not a Python notebook.`,
    },
    {
      type: 'text',
      text: `**Casual:** a small, fast engine that runs a large language model on a normal laptop — no datacenter required.`,
    },
    {
      type: 'text',
      text: `**Engineer:** a **C/C++ inference runtime** that (1) loads **GGUF** checkpoints, (2) builds a **ggml compute graph** for a transformer forward pass, (3) executes that graph on a **backend** (CPU SIMD, Metal, CUDA, Vulkan, …), (4) maintains a **KV cache** across decode steps, and (5) samples the next token until stop.`,
    },
    {
      type: 'text',
      text: `Gerganov’s first concrete goal was almost stubbornly modest: run Meta’s LLaMA on an **Apple Mac using only the CPU** — no special accelerator required. That CPU-first bet is why the project later scaled to phones, SBCs, and hybrid GPU offload without changing its soul.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  GGUF["GGUF file<br/>weights + metadata + tokenizer"] --> Load["mmap / load tensors"]
  Load --> Graph["Build ggml cgraph<br/>attention · FFN · norms"]
  Graph --> Backend["Backend<br/>CPU / Metal / CUDA / …"]
  Backend --> Logits["Logits for next token"]
  Logits --> Sample["Sampler"]
  Sample --> Cache["Update KV cache"]
  Cache --> Graph`,
    },
    {
      type: 'header',
      text: 'Why llama.cpp needed to exist',
    },
    {
      type: 'text',
      text: `When LLMs went mainstream, most people could only use them by **shipping text to someone else’s GPU**. That created three concrete pains:`,
    },
    {
      type: 'text',
      text: `**Cost** — renting inference is a meter that never stops. **Privacy** — prompts leave the device. **Dependence** — no network, no model.`,
    },
    {
      type: 'text',
      text: `**Everyday hardware** means the laptop, desktop, or phone you already own — not an A100 in a rack. llama.cpp’s bet: shrink the model, load it smart, squeeze the CPU, share layers with whatever GPU you have, and keep the loop local.`,
    },
    {
      type: 'text',
      text: `Add the engineer reasons: **inference ≠ training** (you need a forward graph, KV cache, and sampler — not autograd), and **dependencies are latency** (plain C/C++ + optional backends beats a half-gigabyte Python stack when you just want tokens).`,
    },
    {
      type: 'text',
      text: `The official goal, still on the README: **LLM inference with minimal setup and state-of-the-art performance on a wide range of hardware — locally and in the cloud.**`,
    },
    {
      type: 'header',
      text: 'Quick refresher: what an LLM actually does',
    },
    {
      type: 'text',
      text: `An **LLM**’s day job is boring and profound: **guess the next token**. You feed it tokens; it scores every possibility in the vocabulary; sampling picks one; that token is appended; repeat. Billions of learned **weights** (parameters) are the entire knowledge store. Every new token is a storm of multiply–adds across those weights — that storm is what llama.cpp has to run on consumer silicon.`,
    },
    {
      type: 'header',
      text: 'The wall: the model will not fit',
    },
    {
      type: 'text',
      text: `Size is counted in **parameters**. A **7B** model has about seven billion weights. Store each as **FP16** (2 bytes) and you need roughly **7e9 × 2 ≈ 14 GB** just for weights — before KV cache, activations, OS, and browser. Many laptops have **8–16 GB** total RAM. That is the wall.`,
    },
    {
      type: 'code',
      code: `# ballpark weight footprint (ignore overhead)
7B × 2 bytes (FP16)  ≈ 14 GB
7B × 0.5 bytes (~4-bit) ≈  3.5–4.5 GB   # after GGUF Q4-class quant

# same idea at 70B FP16 ≈ 140 GB → Q4-class often ~35–40 GB`,
    },
    {
      type: 'text',
      text: `So the first big idea is not a new architecture. It is **make the weights smaller without making the model much worse.**`,
    },
    {
      type: 'header',
      text: 'The two layers: llama.cpp vs ggml',
    },
    {
      type: 'text',
      text: `Think of **ggml** as the **physics engine** and **llama.cpp** as the **game**.`,
    },
    {
      type: 'text',
      text: `**ggml** knows tensors, ops (\`mul_mat\`, softmax, RMSNorm, …), **compute graphs** (\`ggml_cgraph\`), **backends**, buffers, and a **scheduler** that can split work across devices. It does *not* know “Llama-3 chat template” or “GQA attention layout for this architecture.”`,
    },
    {
      type: 'text',
      text: `**llama.cpp** knows model **architectures** (Llama, Mistral, Qwen, Gemma, …), how to map GGUF tensors onto those graphs, tokenization, sampling, the CLI (\`llama-cli\`), the OpenAI-ish HTTP server (\`llama-server\`), conversion scripts, and the endless zoo of **quantization types**.`,
    },
    {
      type: 'text',
      text: `Hugging Face’s *Introduction to ggml* (Gerganov et al., 2024) frames the library’s pitch: **minimal core**, easy compile (often just GCC/Clang for CPU), tiny binaries vs hundreds of MB of PyTorch, native **quantized tensors**, extreme memory thrift — at the cost of being low-level and still evolving.`,
    },
    {
      type: 'subHeader',
      text: 'ggml concepts you will meet in the debugger',
    },
    {
      type: 'code',
      code: `ggml_context          // arena / container for tensors & graphs
ggml_tensor           // shape + dtype + data pointer (or device buffer)
ggml_cgraph           // ordered ops to execute (the forward pass)
ggml_backend          // CPU | CUDA | Metal | Vulkan | …
ggml_backend_buffer   // device memory holding tensor data
ggml_backend_sched    // multi-backend scheduler (CPU+GPU hybrid)`,
    },
    {
      type: 'text',
      text: `A matmul is not “call cuBLAS somewhere.” You **declare** \`ggml_mul_mat\`, **expand** the graph with \`ggml_build_forward_expand\`, then \`ggml_backend_graph_compute\`. The backend chooses kernels. That indirection is how one model file runs on a Raspberry Pi *and* an RTX card.`,
    },
    {
      type: 'viz',
      viz: 'llama-cpp-arch',
    },
    {
      type: 'header',
      text: 'Hugging Face, GGUF, and where llama.cpp sits',
    },
    {
      type: 'text',
      text: `People mash three nouns together. Keep them separate:`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  HF["Hugging Face hub<br/>Safetensors · configs · GGUF uploads"]
  Conv["convert / quantize<br/>llama.cpp scripts"]
  GGUF["GGUF file"]
  Eng["llama.cpp engine"]
  Apps["Ollama · LM Studio · your app"]
  HF -->|"full weights"| Conv --> GGUF
  HF -->|"ready-made GGUF"| GGUF
  GGUF --> Eng --> Apps`,
    },
    {
      type: 'text',
      text: `**Hugging Face** is primarily the **hub**: model cards, **Safetensors** / PyTorch shards, tokenizers, and (increasingly) community **GGUF** uploads. The **\`transformers\`** library is a **Python training & inference** stack — different runtime from llama.cpp.`,
    },
    {
      type: 'text',
      text: `**GGUF** is the **file format** llama.cpp (and ggml) prefer for local inference: quantized weights + architecture metadata + tokenizer in one mmap-friendly package. It was introduced by the llama.cpp project (Aug 2023) to replace earlier GGML-era formats.`,
    },
    {
      type: 'text',
      text: `**Path A:** download a **GGUF** from HF (search “Q4_K_M gguf”) → point \`llama-cli\` / Ollama at it. **Path B:** take a Safetensors instruct model → run llama.cpp’s **convert** + **quantize** scripts → produce your own GGUF. HF is where weights live; GGUF is how llama.cpp eats them; llama.cpp is the engine that chews.`,
    },
    {
      type: 'header',
      text: 'Quantization: how 70B fits in 20 GB of RAM',
    },
    {
      type: 'text',
      text: `llama.cpp’s cultural center of gravity is **weight-only quantization** baked into GGUF. Shrink each weight to a few bits; keep activations in higher precision for the matmul (often via specialized **integer dot-product** kernels that fuse dequant).`,
    },
    {
      type: 'text',
      text: `A **bit** is a 0/1. Sixteen bits give a fine volume knob; **four bits** give sixteen clicks. We do not chop numbers at random. Weights are handled in small **blocks** (often 32). For each block, find a shared **scale factor** from the block’s magnitude, squeeze each weight to a tiny integer, and restore with \`value ≈ q × scale\` when computing.`,
    },
    {
      type: 'code',
      code: `# block quantization (intuition)
Original block (FP16-ish):
  [ 0.92, -0.31, 0.78, -0.55, 0.12, ... 32 values ... ]
           |
           |  scale ≈ max / 7   (example for signed 4-bit -8..7)
           |  scale = 0.92 / 7 ≈ 0.13
           v
Quantized block:
  scale = 0.13
  [  7,  -2,  6,  -4,  1, ... ]
           |
           |  restore: 7×0.13=0.91 · 6×0.13=0.78 · -4×0.13=-0.52
           v
Close enough — model ~4× smaller, answers almost as good

# ballpark: 7B FP16 ~14 GB  →  Q4-class ~4 GB`,
    },
    {
      type: 'text',
      text: `Classic types (**Q4_0**, **Q5_1**, **Q8_0**, …) are that idea with a **scale** (and sometimes a **min**) per block:`,
    },
    {
      type: 'code',
      code: `# type-0 style:  w ≈ scale * q
# type-1 style:  w ≈ scale * q + min   (asymmetric block)`,
    },
    {
      type: 'subHeader',
      text: 'Decode the name: Q4_K_M',
    },
    {
      type: 'text',
      text: `Download cards say **Q4_K_M**. Split it:`,
    },
    {
      type: 'text',
      text: `**Q4** — about **4 bits** per weight (Q8 ≈ 8 bits: bigger, sharper).`,
    },
    {
      type: 'text',
      text: `**K** — **k-quant**: many small blocks live inside a **super-block** (~256 weights). The super-block keeps a main scale; each small block stores only a cheap adjustment — like one base salary plus tiny plus/minus per person. Scales themselves are quantized so the “helper” numbers stay cheap. Effective bpw becomes non-integer (e.g. Q4_K ≈ **4.5**).`,
    },
    {
      type: 'text',
      text: `**M** — **medium mix**. The “4” does not change; **M** means sensitive **tensors** (some attention / FFN projections) get **extra bits** (often 6-bit) while the bulk stays ~4-bit. **S** (small) keeps more of the model at the base width — slightly smaller file, usually slightly worse quality. **Q4_K_M** is the everyday default because it stays small while quality stays close.`,
    },
    {
      type: 'text',
      text: `k-quants landed via community PR #1684 (2023). A 2026 arXiv study (*Which Quantization Should I Use?* on Llama-3.1-8B-Instruct) confirms the folk wisdom: **format matters, not just nominal bit-width** — mid/high 5-bit-class options are often a robust quality default; aggressive 3-bit is a budget compromise.`,
    },
    {
      type: 'text',
      text: `For GPTQ/AWQ vs GGUF k-quants, see our quantization post — llama.cpp is where those compressed weights *actually get multiplied* on consumer silicon.`,
    },
    {
      type: 'header',
      text: 'GGUF: everything packed in one box',
    },
    {
      type: 'text',
      text: `Early formats (**GGML**, **GGMF**, **GGJT**) grew painful as architectures multiplied. In **August 2023** the project introduced **GGUF** — a single-file binary for ggml executors. One box holds quantized weights, architecture metadata, tokenizer, and quantization settings — no scavenger hunt across sidecar files.`,
    },
    {
      type: 'code',
      code: `+=================================================+
|                  GGUF file                      |
|              (one single file)                  |
|   +-----------------------------------------+   |
|   |  Quantized weights   (the knowledge)    |   |
|   +-----------------------------------------+   |
|   |  Architecture        (how it is built)  |   |
|   +-----------------------------------------+   |
|   |  Tokenizer           (text -> tokens)   |   |
|   +-----------------------------------------+   |
|   |  Quantization settings (how to read it) |   |
|   +-----------------------------------------+   |
+=================================================+

# on disk layout (same idea)
┌─────────────────────────────┐
│ magic + version + KV meta   │  general.architecture = "llama"
│ tensor info table           │  name, shape, dtype, offset
├─────────────────────────────┤
│ aligned tensor blobs        │  Q4_K blocks, embeds, …
└─────────────────────────────┘`,
    },
    {
      type: 'subHeader',
      text: 'mmap: load the model the smart way',
    },
    {
      type: 'text',
      text: `**Memory mapping (mmap)** tells the OS: treat this file *as if* it were already in RAM. Pages fault in on demand. You start working immediately instead of waiting for a multi-gigabyte \`memcpy\`. Bonus: multiple processes can share the same mapped pages.`,
    },
    {
      type: 'code',
      code: `Normal load (slow start):
  Disk [ whole model ]  ===copy all===>  Memory [ whole model ]
                         (wait… then run)

mmap (instant start):
  Disk [ whole model ]  ---- mapped ----> looks like Memory
                         |
                         v
  Only touched pages are pulled in when the forward pass needs them`,
    },
    {
      type: 'header',
      text: 'Backends: SIMD on CPU, layers on GPU',
    },
    {
      type: 'text',
      text: `Originally the pitch was **CPU inference that did not suck**. **SIMD** (*Single Instruction, Multiple Data*) is the trick: one instruction multiplies many lanes at once — eight pairs in one step instead of eight serial steps. llama.cpp tunes for **AVX / AVX2 / AVX-512 / AMX** on x86, **ARM NEON** (+ Accelerate) on Apple, later **RISC-V** vector extensions.`,
    },
    {
      type: 'text',
      text: `Apple Silicon became a **first-class citizen** via **Metal** — unified memory means the GPU can chew weights without PCIe theater. Then the backend list exploded: **CUDA**, **HIP** (AMD), **Vulkan**, **SYCL**, **MUSA**, **CANN**, **OpenCL**, **WebGPU**, **RPC**. Build with \`-DGGML_CUDA=ON\` (etc.); at runtime pick devices with \`--device\` / \`--list-devices\`.`,
    },
    {
      type: 'subHeader',
      text: 'Hybrid offload: gpu-layers / -ngl',
    },
    {
      type: 'text',
      text: `A small GPU often cannot hold the whole model. llama.cpp splits the stack into **layers** and lets you choose how many sit in VRAM (\`-ngl\` / \`n_gpu_layers\` / “gpu-layers” in UIs). More layers on GPU → usually faster, until you spill. The rest stays on CPU. The **ggml backend scheduler** stitches the graph across buffers.`,
    },
    {
      type: 'code',
      code: `                 One LLM = stacked layers
   +---------------------------------------------------+
   |  Layer 1   Layer 2   Layer 3  ...  Layer N        |
   +---------------------------------------------------+
        |  (fit in GPU memory)      |  (the rest)
        v                           v
   +----------------+        +----------------+
   |      GPU       |        |      CPU       |
   |  many workers  |        |  always there  |
   +----------------+        +----------------+
            \\                      /
             --> next token, in order`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph Hybrid["Hybrid inference"]
    L0["Layers 0..k<br/>GPU VRAM"]
    Lk["Layers k+1..L<br/>CPU RAM"]
  end
  Prompt --> L0 --> Lk --> Token`,
    },
    {
      type: 'header',
      text: 'The full journey of a prompt',
    },
    {
      type: 'text',
      text: `Strip the romance. End-to-end:`,
    },
    {
      type: 'text',
      text: `**1.** Point llama.cpp at a **GGUF** — **mmap** makes it ready almost instantly.`,
    },
    {
      type: 'text',
      text: `**2.** Type a **prompt** (plain text).`,
    },
    {
      type: 'text',
      text: `**3.** The **tokenizer** (inside the GGUF) turns text into **tokens** — often words or pieces of words as integer IDs. Chat models also wrap messages in a **chat template**. Wrong template → weird replies with perfect weights.`,
    },
    {
      type: 'subHeader',
      text: 'Prefill, then decode',
    },
    {
      type: 'text',
      text: `**4a. Prefill (prompt processing):** the whole prompt runs in one forward pass; attention sees all prompt positions. Often **compute-heavy**; GPUs love it. Reported as prompt-processing tokens/s.`,
    },
    {
      type: 'text',
      text: `**4b. Decode:** one new token at a time. Recomputing attention over \`0…t-1\` from scratch every step would be suicide — so **KV cache** stores prior **K** and **V**. Decode = read cache + new row + append. Usually **memory-bandwidth bound**.`,
    },
    {
      type: 'code',
      code: `# Conceptual decode step
h_t     = embed(token_t)
for layer in transformer:
    q,k,v = proj(h_t)
    K_cache[layer].append(k)
    V_cache[layer].append(v)
    attn  = softmax(q @ K_cache^T / sqrt(d)) @ V_cache
    h_t   = ffn(attn + residual…)
logits  = unembed(h_t)
token_{t+1} = sample(logits)   # greedy / temp / top-p / …`,
    },
    {
      type: 'text',
      text: `**5.** **Sampling** picks the next token from the score vector (greedy, temperature, top-p, …).`,
    },
    {
      type: 'text',
      text: `**6.** Detokenize and **stream** the piece of text immediately — that is why answers appear word by word.`,
    },
    {
      type: 'text',
      text: `**7–8.** Append to KV cache, feed the new token back in, repeat until stop. Quants, Metal kernels, and \`-ngl\` are all accelerators of this loop.`,
    },
    {
      type: 'code',
      code: `GGUF on disk
     |  mmap
     v
prompt (text) --> tokenizer --> tokens
     |
     v
layers (quant weights, CPU+GPU split)
     |
     v
logits --> sample --> token --> text (streamed)
     |                    |
     +---- KV cache <-----+   (repeat)`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  P["Prompt"] --> T["Tokens"]
  T --> Prefill["Prefill"]
  Prefill --> Dec["Decode loop"]
  Dec --> S["Sample + stream"]
  S --> KV["KV cache"]
  KV --> Dec`,
    },
    {
      type: 'header',
      text: 'Download and run: Windows and Linux',
    },
    {
      type: 'text',
      text: `Two honest paths: **prebuilt binaries** (fastest first token) or **build from source** (best for CUDA/Vulkan flags and bleeding-edge commits). Releases are tagged like \`b10064\` — not semver. Grab the latest from the GitHub **Releases** page (link at the bottom).`,
    },
    {
      type: 'subHeader',
      text: 'Windows — prebuilt (recommended first hour)',
    },
    {
      type: 'code',
      code: `# 1) Open the latest Release on GitHub → Assets
#    Pick a zip that matches your silicon, e.g.:
#      llama-b****-bin-win-cpu-x64.zip          (CPU only)
#      llama-b****-bin-win-cuda-12.4-x64.zip    (NVIDIA; also grab matching cudart zip)
#      llama-b****-bin-win-vulkan-x64.zip       (AMD/Intel/NVIDIA via Vulkan)
#
# 2) Unzip to e.g. C:\\tools\\llama.cpp\\
# 3) Download a GGUF (Hugging Face) into a models\\ folder
# 4) In PowerShell:

cd C:\\tools\\llama.cpp
.\\llama-cli.exe -m .\\models\\model-Q4_K_M.gguf -ngl 99 -p "Hello from Windows"

# HTTP API (OpenAI-compatible-ish):
.\\llama-server.exe -m .\\models\\model-Q4_K_M.gguf -ngl 99 --port 8080`,
    },
    {
      type: 'text',
      text: `**CUDA tip:** the Release page ships a separate **cudart** zip — unpack those DLLs next to the binaries if Windows complains about missing CUDA runtime libraries. **\`-ngl 99\`** means “offload as many layers as fit”; use \`0\` for CPU-only.`,
    },
    {
      type: 'subHeader',
      text: 'Windows — build from source',
    },
    {
      type: 'code',
      code: `# Needs: Git, CMake, Visual Studio 2022 ("Desktop development with C++")
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp

# CPU Release build
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release

# NVIDIA GPU (flag name is GGML_CUDA — not the older LLAMA_CUDA)
cmake -B build -DGGML_CUDA=ON -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release

# Binaries land in build\\bin\\Release\\  (or build\\bin\\ depending on generator)
.\\build\\bin\\Release\\llama-cli.exe -m .\\models\\model.gguf -ngl 40`,
    },
    {
      type: 'text',
      text: `WSL2 + Ubuntu is also fine on Windows: follow the Linux steps inside the distro if native VS builds feel painful.`,
    },
    {
      type: 'subHeader',
      text: 'Linux — prebuilt or source',
    },
    {
      type: 'code',
      code: `# Option A — prebuilt tarball from Releases (ubuntu-x64 / cuda / rocm / …)
# tar -xzf llama-b****-bin-ubuntu-x64.tar.gz && cd …

# Option B — build (Debian/Ubuntu-ish)
sudo apt update
sudo apt install -y build-essential cmake git
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j

# NVIDIA
cmake -B build -DGGML_CUDA=ON -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j

# Run
./build/bin/llama-cli -m ./models/model-Q4_K_M.gguf -ngl 99 \\
  -p "Explain mmap like I'm an engineer"

./build/bin/llama-server -m ./models/model-Q4_K_M.gguf -ngl 99 --port 8080
./build/bin/llama-bench -m ./models/model-Q4_K_M.gguf`,
    },
    {
      type: 'text',
      text: `Get a model: on Hugging Face search \`Q4_K_M GGUF\`, download one \`.gguf\` file, pass \`-m path/to/file.gguf\`. Prefer instruct/chat GGUFs and the card’s **chat template** notes. Convert Safetensors yourself only when you need a custom quant — scripts live in the llama.cpp repo.`,
    },
    {
      type: 'header',
      text: 'llama.cpp vs Ollama (and friends)',
    },
    {
      type: 'viz',
      viz: 'llama-cpp-compare',
    },
    {
      type: 'text',
      text: `**Short version:** llama.cpp is the **engine**. **Ollama** / **LM Studio** are **products** that wrap an engine like it — model pulls, chat UI, \`ollama run\`, local APIs — so you rarely touch cmake. Under the floorboards you still meet **GGUF** and ggml-style inference.`,
    },
    {
      type: 'code',
      code: `# Same model, two interfaces (illustrative)
# Engine:
llama-cli -m ./llama3.2-Q4_K_M.gguf -ngl 99 -p "hi"

# Product:
ollama run llama3.2
# (Ollama fetches/manages weights; you don't pass a raw path)`,
    },
    {
      type: 'text',
      text: `Use **Ollama/LM Studio** for daily chat and demos. Use **llama.cpp** when you need exact backends, \`llama-bench\`, custom server flags, brand-new architecture support, or reproducible scripts in CI. They are **complementary**, not rivals.`,
    },
    {
      type: 'header',
      text: 'The ecosystem that grew on top',
    },
    {
      type: 'text',
      text: `That open inference ABI — **file format + graph + backends** — is why a thousand apps bloomed without each reinventing matmul. When someone says “I run Llama locally,” a GGUF and a ggml graph are often under the floorboards.`,
    },
    {
      type: 'header',
      text: 'Mental model for engineers',
    },
    {
      type: 'text',
      text: `**Training stack** (PyTorch, JAX): differentiate, optimize, shard. **llama.cpp stack**: load, graph, execute, sample.`,
    },
    {
      type: 'text',
      text: `If inference is slow, ask: **prefill or decode?** Prefill → bigger GEMMs, GPU helps. Decode → KV size, bandwidth, quant kernel quality, batch size 1 reality.`,
    },
    {
      type: 'text',
      text: `If quality collapses after quant: bump bit-width, try **Q5_K_M / Q6_K**, keep embeddings / output head higher precision, or re-read which tensors the mix leaves fat.`,
    },
    {
      type: 'text',
      text: `If replies are “dumb but fluent”: check **chat template** and stop tokens before blaming k-quants.`,
    },
    {
      type: 'header',
      text: 'Takeaways',
    },
    {
      type: 'text',
      text: `**llama.cpp exists because inference wanted out of the training greenhouse** — onto CPUs, phones, laptops, and cheap GPUs.`,
    },
    {
      type: 'text',
      text: `**Georgi Gerganov** built it on **ggml**; the community turned it into the default local-LLM engine.`,
    },
    {
      type: 'text',
      text: `Technically it is a **GGUF loader + architecture graphs + backend executors + KV cache + sampler**, with quantization as the reason consumer RAM is enough.`,
    },
    {
      type: 'text',
      text: `The story reads like folklore. The implementation is systems programming: memory layouts, SIMD, kernels, and a graph that does not care whether the silicon is Metal or CUDA — only that the next token arrives.`,
    },
    {
      type: 'text',
      text: `One-line summary of the everyday-hardware trick: **quantize → pack GGUF → mmap → SIMD CPU → optional GPU layers → stream tokens.**`,
    },
    {
      type: 'text',
      text: `Trade-off to keep honest: heavier quantization → smaller/faster, slightly less accurate. **Q4_K_M** remains the everyday default; bump to Q5/Q6 when quality matters more than RAM.`,
    },
    {
      type: 'reference',
      href: 'https://github.com/ggml-org/llama.cpp',
      text: 'ggml-org/llama.cpp (source + README)',
    },
    {
      type: 'reference',
      href: 'https://github.com/ggml-org/llama.cpp/releases',
      text: 'Prebuilt Releases (Windows / Linux / macOS zips)',
    },
    {
      type: 'reference',
      href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
      text: 'Build docs (CUDA, Metal, Vulkan, HIP, …)',
    },
    {
      type: 'reference',
      href: 'https://outcomeschool.com/blog/how-does-llama-cpp-run-llms-on-everyday-hardware',
      text: 'Outcome School: How does llama.cpp run LLMs on everyday hardware?',
    },
    {
      type: 'reference',
      href: 'https://blog.steelph0enix.dev/posts/llama-cpp-guide/',
      text: 'SteelPh0enix: practical llama.cpp guide',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/blog/introduction-to-ggml',
      text: 'Hugging Face: Introduction to ggml',
    },
    {
      type: 'reference',
      href: 'https://github.com/ggerganov/ggml/blob/master/docs/gguf.md',
      text: 'GGUF format specification',
    },
    {
      type: 'reference',
      href: 'https://arxiv.org/abs/2601.14277',
      text: 'arXiv: Which Quantization Should I Use? (GGUF study)',
    },
    {
      type: 'link',
      href: '#/llm-quantization',
      text: 'Related: LLM quantization (bits, GGUF, GPTQ/AWQ)',
    },
    {
      type: 'link',
      href: '#/gpu-llm-inference',
      text: 'Related: why GPUs dominate the matmuls',
    },
    {
      type: 'link',
      href: '#/llm-model-files',
      text: 'Related: Safetensors & HF model files (pre-GGUF world)',
    },
  ],
};

export default llamaCppContent;
