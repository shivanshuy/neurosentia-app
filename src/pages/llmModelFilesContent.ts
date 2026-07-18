const llmModelFilesContent = {
  header: 'How LLM model files are stored',
  text: `Open a Hugging Face model page and you see a pile of JSON and multi‑gigabyte .safetensors shards — not one mysterious “model.bin.” This guide walks the standard layout using openai/gpt-oss-20b as a real example: what each file is, what format the bytes use, what data lives inside, and why the loader needs it.`,
  contents: [
    {
      type: 'header',
      text: 'The big picture: three jobs, many files',
    },
    {
      type: 'text',
      text: `A causal LLM on disk is not a single blob. Think of three jobs:`,
    },
    {
      type: 'text',
      text: `**1. Architecture & hyperparameters —** how many layers, hidden size, vocab size, attention layout. Stored as small JSON (config.json).`,
    },
    {
      type: 'text',
      text: `**2. Learned parameters —** the actual dials (weights and biases). Stored as large binary tensors, usually Safetensors, often split into shards.`,
    },
    {
      type: 'text',
      text: `**3. Text ↔ numbers —** tokenizer vocab, special tokens, and chat formatting. Stored as tokenizer JSON / Jinja templates.`,
    },
    {
      type: 'text',
      text: `**Optional extras:** generation defaults, license, README, and sometimes alternate folders (e.g. metal/, original/) with the same model in another packaging.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  Prompt["Your prompt text"] --> Tok["Tokenizer files"]
  Tok --> Ids["Token ids"]
  Ids --> W["Weight shards .safetensors"]
  Cfg["config.json"] --> W
  W --> Logits["Next-token logits"]
  Gen["generation_config.json"] --> Sample["Sampling / stop rules"]
  Logits --> Sample
  Sample --> Out["Generated text"]`,
    },
    {
      type: 'link',
      href: 'https://huggingface.co/openai/gpt-oss-20b/tree/main',
      text: 'Example repo: openai/gpt-oss-20b (Files tab)',
    },
    {
      type: 'header',
      text: 'What you see on gpt-oss-20b',
    },
    {
      type: 'code',
      code: `openai/gpt-oss-20b/
  config.json
  generation_config.json
  model.safetensors.index.json
  model-00000-of-00002.safetensors   (~4.8 GB)
  model-00001-of-00002.safetensors   (~4.8 GB)
  model-00002-of-00002.safetensors   (~4.2 GB)
  tokenizer.json
  tokenizer_config.json
  special_tokens_map.json
  chat_template.jinja
  README.md, LICENSE, USAGE_POLICY
  .gitattributes
  metal/     (optional alternate packaging)
  original/  (optional alternate packaging)`,
    },
    {
      type: 'text',
      text: `Repo size on the Hub is listed around tens of GB because of those weight shards (and any duplicate folders). The “brain” is the shards + config; without the tokenizer you cannot turn text into the integer ids the model expects.`,
    },
    {
      type: 'header',
      text: 'config.json — the blueprint',
    },
    {
      type: 'text',
      text: `**Format:** JSON text. **Purpose:** tell Transformers (or vLLM, etc.) which Python class to build and with which sizes. No learned floats live here — only structure.`,
    },
    {
      type: 'text',
      text: `For gpt-oss-20b, important fields include:`,
    },
    {
      type: 'code',
      code: `{
  "model_type": "gpt_oss",
  "architectures": ["GptOssForCausalLM"],
  "vocab_size": 201088,
  "hidden_size": 2880,
  "num_hidden_layers": 24,
  "num_attention_heads": 64,
  "num_key_value_heads": 8,
  "head_dim": 64,
  "max_position_embeddings": 131072,
  "num_local_experts": 32,
  "experts_per_token": 4,
  "quantization_config": { "quant_method": "mxfp4", ... },
  "eos_token_id": 200002,
  "pad_token_id": 199999
}`,
    },
    {
      type: 'text',
      text: `architectures / model_type pick the code path (GptOssForCausalLM). vocab_size must match the tokenizer’s id range. hidden_size, num_hidden_layers, and attention head counts define tensor shapes — if they disagree with the weight files, load fails. This model is a Mixture-of-Experts style design (num_local_experts, experts_per_token). quantization_config says expert weights are stored in MXFP4 (a 4-bit float packing); some modules stay denser (attention, router, embeddings, lm_head are listed under modules_to_not_convert).`,
    },
    {
      type: 'header',
      text: 'Weight files — Safetensors shards',
    },
    {
      type: 'subHeader',
      text: 'What is Safetensors?',
    },
    {
      type: 'text',
      text: `Safetensors is a binary format for tensors (named multi-dimensional arrays of numbers). Compared with older pickle-based .bin / pytorch_model.bin files, it is designed so loading does not execute arbitrary Python — safer to download from the internet.`,
    },
    {
      type: 'text',
      text: `On disk, a .safetensors file is roughly:`,
    },
    {
      type: 'code',
      code: `[8-byte header length N]
[N bytes of UTF-8 JSON header]
[raw tensor bytes...]

# Header JSON maps each tensor name →
#   dtype  (e.g. F16, BF16, F32, or quantized layout metadata)
#   shape  (e.g. [2880, 2880])
#   data_offsets  [start, end) into the raw byte region`,
    },
    {
      type: 'text',
      text: `Each entry is one parameter tensor: for example model.layers.0.self_attn.q_proj.weight is the query projection matrix for layer 0. Values are machine floats (or packed quantized blocks) — not text. Libraries memory-map or copy those slices into GPU/CPU arrays and wire them into the module tree built from config.json.`,
    },
    {
      type: 'subHeader',
      text: 'Why shards? model-0000x-of-00002.safetensors',
    },
    {
      type: 'text',
      text: `One 20B-class checkpoint is too large for comfortable single-file upload/download and for some filesystems. Hugging Face splits weights across shards. Naming model-00000-of-00002.safetensors … model-00002-of-00002.safetensors means “part i of a sharded set” (here three files totaling on the order of ~13–14 GB of tensor payload per the index metadata).`,
    },
    {
      type: 'subHeader',
      text: 'model.safetensors.index.json — the phone book',
    },
    {
      type: 'text',
      text: `**Format:** JSON. **Purpose:** map every parameter name → which shard file holds it, plus total_size in bytes.`,
    },
    {
      type: 'code',
      code: `{
  "metadata": { "total_size": 13761264768 },
  "weight_map": {
    "model.layers.0.self_attn.q_proj.weight": "model-00000-of-00002.safetensors",
    "model.layers.0.mlp.experts.gate_up_proj_blocks": "model-00000-of-00002.safetensors",
    "model.embed_tokens.weight": "model-00002-of-00002.safetensors",
    "lm_head.weight": "model-00002-of-00002.safetensors",
    ...
  }
}`,
    },
    {
      type: 'text',
      text: `When you call AutoModelForCausalLM.from_pretrained(...), the library reads this index, opens only the shards it needs, and places each tensor on the matching nn.Parameter. You rarely open shards by hand.`,
    },
    {
      type: 'text',
      text: `**Name patterns to recognize:** embed_tokens.weight = token embedding table (vocab_size × hidden_size). self_attn.q/k/v/o_proj = attention projections. mlp.* = feed-forward / experts. *.bias = additive bias vectors. layernorm / norm.weight = normalization scales. lm_head.weight = final projection from hidden states to vocab logits (next-token scores). On this model, MoE expert tensors often appear as *_blocks and *_scales because MXFP4 stores packed blocks plus scale factors instead of one plain fp16 matrix.`,
    },
    {
      type: 'header',
      text: 'Tokenizer files — text becomes ids',
    },
    {
      type: 'subHeader',
      text: 'tokenizer.json',
    },
    {
      type: 'text',
      text: `**Format:** large JSON (often tens of MB). **Purpose:** the full fast tokenizer definition used by Hugging Face tokenizers (Rust-backed): vocabulary, merges or scores (depending on BPE / Unigram / WordPiece), pre-tokenizer rules, post-processors, and normalizers. This is the file that turns "Hello" into a list of integer token ids the model was trained on.`,
    },
    {
      type: 'text',
      text: `Data inside is not neural weights — it is string↔id mappings and algorithmic rules. gpt-oss-20b’s vocab_size is 201088, so ids run in that range (including many special/reserved tokens).`,
    },
    {
      type: 'subHeader',
      text: 'tokenizer_config.json',
    },
    {
      type: 'text',
      text: `**Format:** JSON. **Purpose:** high-level tokenizer settings and the special-token table the Python wrapper needs: which string is bos_token, eos_token, pad_token; tokenizer_class (here PreTrainedTokenizerFast); model_max_length; and added_tokens_decoder mapping id → token string and flags (special, normalized, …).`,
    },
    {
      type: 'code',
      code: `# Snippets from gpt-oss-20b tokenizer_config.json
"bos_token": "<|startoftext|>"     # id 199998
"eos_token": "<|return|>"          # id 200002
"pad_token": "<|endoftext|>"       # id 199999
# plus <|message|>, <|call|>, <|channel|>, ... for chat / tools`,
    },
    {
      type: 'subHeader',
      text: 'special_tokens_map.json',
    },
    {
      type: 'text',
      text: `**Format:** small JSON. **Purpose:** a short alias map of the main special roles (bos / eos / pad). Redundant with parts of tokenizer_config, but kept for compatibility with older loaders.`,
    },
    {
      type: 'code',
      code: `{
  "bos_token": "<|startoftext|>",
  "eos_token": "<|return|>",
  "pad_token": "<|endoftext|>"
}`,
    },
    {
      type: 'subHeader',
      text: 'chat_template.jinja',
    },
    {
      type: 'text',
      text: `**Format:** Jinja2 template text. **Purpose:** turn a list of chat messages ({role, content, …}) into the exact string the model expects before tokenization — system/user/assistant markers, tool-call wrappers, and so on. apply_chat_template(...) renders this file. Wrong template → model still “runs,” but behaves like it was trained on a different prompt format.`,
    },
    {
      type: 'header',
      text: 'generation_config.json — how to sample',
    },
    {
      type: 'text',
      text: `**Format:** JSON. **Purpose:** default generate() behavior: whether to sample, which token ids mean “stop,” pad id, etc. Not weights.`,
    },
    {
      type: 'code',
      code: `{
  "bos_token_id": 199998,
  "do_sample": true,
  "eos_token_id": [200002, 199999, 200012],
  "pad_token_id": 199999
}`,
    },
    {
      type: 'text',
      text: `Multiple eos_token_id values mean generation can stop on <|return|>, <|endoftext|>, or <|call|> depending on the dialogue / tool protocol. You can override all of this at call time (temperature, max_new_tokens, …).`,
    },
    {
      type: 'header',
      text: 'Docs, license, and Hub plumbing',
    },
    {
      type: 'text',
      text: `**README.md —** human docs (how to run, intended use). **LICENSE / USAGE_POLICY —** legal terms (this model is Apache-2.0 on the Hub card, plus a usage policy file). **.gitattributes —** Git LFS rules so large binaries are stored as LFS pointers rather than raw git blobs. **metal/ and original/ —** optional parallel trees (e.g. another runtime’s packaging). The “canonical” Transformers path for most people is the root config + shards + tokenizer files above.`,
    },
    {
      type: 'header',
      text: 'What happens when you load',
    },
    {
      type: 'code',
      code: `from transformers import AutoTokenizer, AutoModelForCausalLM

tok = AutoTokenizer.from_pretrained("openai/gpt-oss-20b")
# reads tokenizer.json + tokenizer_config.json (+ special_tokens_map, chat_template)

model = AutoModelForCausalLM.from_pretrained("openai/gpt-oss-20b")
# 1) parse config.json → build empty GptOssForCausalLM
# 2) read model.safetensors.index.json
# 3) load tensors from each .safetensors shard into matching parameters
# 4) apply quantization_config handling (MXFP4 experts, etc.)`,
    },
    {
      type: 'text',
      text: `At inference: text → tokenizer → input_ids → forward through layers (weights from shards) → logits over vocab_size → sample or argmax using generation_config defaults → decode ids back to text with the tokenizer.`,
    },
    {
      type: 'header',
      text: 'Other files you will meet elsewhere',
    },
    {
      type: 'text',
      text: `Not every repo looks identical. Common variants:`,
    },
    {
      type: 'code',
      code: `pytorch_model.bin / model.safetensors
  → single-file weights (small models)

model-00001-of-00003.safetensors + index
  → sharded (large models) — same idea as gpt-oss-20b

adapter_model.safetensors + adapter_config.json
  → LoRA / PEFT only (tiny); base model still required

*.gguf
  → llama.cpp / Ollama style single-file (different ecosystem)

tokenizer.model
  → SentencePiece vocab (many older Llama-family repos)

vocab.json + merges.txt
  → classic GPT-2/RoBERTa BPE split instead of one tokenizer.json`,
    },
    {
      type: 'link',
      href: '#/lora-fine-tuning',
      text: 'Related: what LoRA saves instead of a full shard set',
    },
    {
      type: 'header',
      text: 'Cheat sheet',
    },
    {
      type: 'code',
      code: `File                         Format        Holds                         Needed to…
---------------------------  ------------  ----------------------------  ------------------------
config.json                  JSON          architecture hyperparams      build the module tree
*.safetensors (+ index)      binary+JSON   weight tensors                run the network
tokenizer.json               JSON          vocab + encode rules          text ↔ token ids
tokenizer_config.json        JSON          special tokens, class         configure tokenizer
special_tokens_map.json      JSON          bos/eos/pad aliases           compatibility
chat_template.jinja          Jinja text    chat formatting               apply_chat_template
generation_config.json       JSON          sample / stop defaults        generate() defaults
README / LICENSE             text          docs / legal                  humans / compliance`,
    },
    {
      type: 'text',
      text: `**Mental model:** config draws the empty house, Safetensors fills every room with numbers, the tokenizer is the front door between language and integers, and generation_config is the house rules for when to stop talking.`,
    },
    {
      type: 'header',
      text: 'Sources',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/openai/gpt-oss-20b/tree/main',
      text: 'openai/gpt-oss-20b — file tree on Hugging Face',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/docs/safetensors/index',
      text: 'Hugging Face Safetensors documentation',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/docs/transformers/main/en/main_classes/model',
      text: 'Transformers — saving and loading models',
    },
  ],
};

export default llmModelFilesContent;
