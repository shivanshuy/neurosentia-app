const llmDatasetsContent = {
  header: 'LLM training datasets: teach the model what to want',
  text: `A base model knows language. It does not know your support tone, your SQL dialect, or that answers must be JSON. Datasets are how you teach desire — row by row. This guide shows real instruction and chat examples, how they differ, which public packs train which kinds of models, how to format data for Llama / Mistral / Qwen, and a playbook so you can build your own datasets for real use cases.`,
  contents: [
    {
      type: 'header',
      text: 'Cold open: the model that won’t do your job',
    },
    {
      type: 'text',
      text: `You ask a fresh base model: *“Reset my Widget Pro password.”* It invents a generic internet answer. You fine-tune on two thousand real support transcripts. Suddenly it sounds like your team — with your URL and your tone.`,
    },
    {
      type: 'text',
      text: `Nothing mystical happened. You changed the **training distribution**. **LLM datasets** are collections of examples used to **pretrain**, **continued-pretrain**, or **fine-tune** models. Architecture is the engine; data is the road map.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  Base["Base LLM<br/>knows language"] --> Data["Dataset<br/>shows desired behavior"]
  Data --> Tune["SFT / LoRA / DPO"]
  Tune --> Job["Model that does YOUR job"]`,
    },
    {
      type: 'header',
      text: 'Instruction vs chat vs preference — the big difference',
    },
    {
      type: 'text',
      text: `People say “training data” and mean three different row shapes. Mixing them up is the #1 beginner mistake.`,
    },
    {
      type: 'viz',
      viz: 'dataset-kind-compare',
    },
    {
      type: 'text',
      text: `**Instruction datasets (single-turn)** — one command, optional context, one target answer. Good for: summarize, rewrite, classify, generate SQL, “write an email.” Think **Alpaca** triples: instruction / input / output.`,
    },
    {
      type: 'text',
      text: `**Chat datasets (multi-turn)** — a sequence of user/assistant turns. Good for: support bots, tutors, sales assistants that ask clarifying questions. The model must use earlier turns. Think **ShareGPT** or **messages[]**.`,
    },
    {
      type: 'text',
      text: `**Preference datasets** — prompt + **chosen** answer + **rejected** answer. Good for: after the model can already reply, sharpen tone/safety with **DPO/ORPO**. Not a replacement for SFT.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph Inst["Instruction row"]
    I1["instruction + input"] --> I2["output"]
  end
  subgraph Chat["Chat row"]
    C1["user"] --> C2["assistant"] --> C3["user"] --> C4["assistant"]
  end
  subgraph Pref["Preference row"]
    P1["prompt"] --> P2["chosen ✓"]
    P1 --> P3["rejected ✗"]
  end`,
    },
    {
      type: 'header',
      text: 'Worked examples: instruction datasets',
    },
    {
      type: 'text',
      text: `**Use when** the user gives a task and expects one solid answer — not a long dialogue.`,
    },
    {
      type: 'subHeader',
      text: 'Example A — pure generation (empty input)',
    },
    {
      type: 'code',
      code: `{
  "instruction": "Write a 2-sentence product blurb for a noise-cancelling headphone aimed at remote workers.",
  "input": "",
  "output": "Block the open-office buzz without living in your headphones. Clear calls, all-day comfort, one charge that survives back-to-back standups."
}`,
    },
    {
      type: 'subHeader',
      text: 'Example B — instruction + context (input matters)',
    },
    {
      type: 'code',
      code: `{
  "instruction": "Extract action items as a bullet list. Do not invent tasks.",
  "input": "Ami will send the deck by Thursday. Raj owns vendor pricing. We skip the Friday sync.",
  "output": "- Ami: send deck by Thursday\\n- Raj: own vendor pricing\\n- Skip Friday sync"
}`,
    },
    {
      type: 'subHeader',
      text: 'Example C — domain SQL',
    },
    {
      type: 'code',
      code: `{
  "instruction": "Write SQLite for the question. Use only the given schema.",
  "input": "Schema: orders(id, user_id, total, created_at)\\nQuestion: total revenue last 7 days",
  "output": "SELECT SUM(total) FROM orders WHERE created_at >= date('now','-7 day');"
}`,
    },
    {
      type: 'text',
      text: `**Real-world instruction packs:** Stanford **Alpaca** (~52k Self-Instruct) · **Databricks Dolly 15k** (human-written) · **OpenHermes 2.5** (large mixed) · **LIMA** (small, high quality) · **Magicoder-OSS-Instruct** (code) · **sql-create-context** / **synthetic_text_to_sql** (Text→SQL). Links in References.`,
    },
    {
      type: 'header',
      text: 'Worked examples: chat datasets',
    },
    {
      type: 'text',
      text: `**Use when** success needs memory across turns — clarification, constraints, personality.`,
    },
    {
      type: 'subHeader',
      text: 'Example D — support chat (ShareGPT-style)',
    },
    {
      type: 'code',
      code: `{
  "conversations": [
    { "from": "system", "value": "You are WidgetCo support. Never invent policy. Ask one clarifying question when needed." },
    { "from": "human", "value": "My refund is late." },
    { "from": "gpt", "value": "Sorry about the wait — was the payment card or wallet?" },
    { "from": "human", "value": "Card." },
    { "from": "gpt", "value": "Card refunds post in 5–7 business days. If day 8+ with no credit, reply with order id and I will escalate." }
  ]
}`,
    },
    {
      type: 'subHeader',
      text: 'Example E — tutor chat (must use earlier answer)',
    },
    {
      type: 'code',
      code: `{
  "messages": [
    { "role": "system", "content": "You teach Python to beginners. One idea per turn." },
    { "role": "user", "content": "What is a list?" },
    { "role": "assistant", "content": "An ordered collection in square brackets, e.g. [1, 2, 3]." },
    { "role": "user", "content": "How do I get the last item?" },
    { "role": "assistant", "content": "Use index -1: my_list[-1]. That works because lists are ordered." }
  ]
}`,
    },
    {
      type: 'text',
      text: `Notice turn 2 of the assistant **refers back** to lists. If your chat data is only disconnected Q&A pasted into turns, you are still training instruction mode in disguise.`,
    },
    {
      type: 'text',
      text: `**Real-world chat packs:** **OpenAssistant OASST1** (human multi-turn) · ShareGPT-style Vicuna data · customer-support exports you anonymize yourself · roleplay/character sets when you need persona (use carefully).`,
    },
    {
      type: 'header',
      text: 'Other dataset types you may need',
    },
    {
      type: 'text',
      text: `**Tool / function-calling** — assistant must emit structured calls (name + JSON args), then optionally use tool results. Packs: **Glaive function-calling**, ChatML function datasets.`,
    },
    {
      type: 'code',
      code: `{
  "messages": [
    { "role": "system", "content": "Call tools as JSON only when needed." },
    { "role": "user", "content": "Weather in Pune tomorrow?" },
    { "role": "assistant", "content": "{\\"name\\":\\"get_weather\\",\\"arguments\\":{\\"city\\":\\"Pune\\",\\"when\\":\\"tomorrow\\"}}" }
  ]
}`,
    },
    {
      type: 'text',
      text: `**RAG / grounded QA** — question + retrieved passages → answer that stays faithful. Pack: **neural-bridge/rag-dataset-12000**; better: your docs turned into QA.`,
    },
    {
      type: 'text',
      text: `**Classification / NER** — labels or spans, not essays. Often a small **BERT-class encoder** beats a giant chat model. **Summarization** pairs (doc → summary). **Preference** pairs for DPO after SFT.`,
    },
    {
      type: 'viz',
      viz: 'dataset-goal-map',
    },
    {
      type: 'header',
      text: 'Which public datasets train which kinds of models?',
    },
    {
      type: 'text',
      text: `Match **job → data → starting checkpoint**.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph ChatAssist["Chat assistants"]
    A1["Start: Llama/Mistral/Qwen/Phi base or instruct"] --> A2["Data: OASST · Dolly · Alpaca · Hermes · your tickets"]
  end
  subgraph CodeAssist["Code assistants"]
    B1["Start: CodeLlama · DeepSeek-Coder · Qwen-Coder"] --> B2["Data: Magicoder · repo Q&A · PR review pairs"]
  end
  subgraph ToolAgent["Tool-using agents"]
    C1["Start: instruct + tool template"] --> C2["Data: Glaive · custom tool traces"]
  end
  subgraph Analyst["Text-to-SQL / analysts"]
    D1["Start: instruct or code LLM"] --> D2["Data: sql-create-context · synthetic SQL · your schema QA"]
  end
  subgraph Classifier["Classifiers / NER"]
    E1["Start: BERT / RoBERTa / small encoder"] --> E2["Data: labeled CSV · span JSON"]
  end`,
    },
    {
      type: 'text',
      text: `**Rule of thumb:** decoder LLMs for open-ended generation and tools; encoders for pure labeling; code specialists when the job is mostly code; always prefer a few thousand **on-domain** rows over a million random internet instructions.`,
    },
    {
      type: 'header',
      text: 'How to write data for different models',
    },
    {
      type: 'text',
      text: `Author in **portable JSON**. At training time, render with that model’s **chat template** (special tokens). Serving must use the same template — or quality falls off a cliff.`,
    },
    {
      type: 'viz',
      viz: 'dataset-format',
    },
    {
      type: 'viz',
      viz: 'dataset-model-template',
    },
    {
      type: 'text',
      text: `**Practical workflow:** (1) write ShareGPT/ChatML/Alpaca JSONL, (2) load tokenizer for Llama-3 / Mistral / Qwen, (3) apply \`tokenizer.apply_chat_template(...)\`, (4) spot-check rendered strings, (5) train LoRA on those strings. Never hand-type special tokens unless you know the exact version.`,
    },
    {
      type: 'header',
      text: 'Playbooks: create your own for real use cases',
    },
    {
      type: 'text',
      text: `After this section you should be able to open a blank JSONL and start. Each playbook: goal → row shape → 10 seed examples → scale → eval.`,
    },
    {
      type: 'subHeader',
      text: 'Playbook 1 — Customer support chat bot',
    },
    {
      type: 'text',
      text: `**Shape:** multi-turn chat + system policy. **Seeds:** 30–50 real tickets (anonymize PII). Cover: refund, cancel, shipping, angry user, “I don’t know → escalate.” **Scale:** rewrite variants; keep gold policy quotes. **Eval:** scripted dialogues; fail if model invents policy. **Start model:** small instruct (3B–8B) + LoRA.`,
    },
    {
      type: 'subHeader',
      text: 'Playbook 2 — Internal “how do I…?” instruction model',
    },
    {
      type: 'text',
      text: `**Shape:** Alpaca instruction/input/output. **Seeds:** turn wiki pages into “How do I X?” → answer with links. **Scale:** Self-Instruct from seeds, human filter. **Eval:** exact steps / link presence. **Start model:** general instruct LLM.`,
    },
    {
      type: 'subHeader',
      text: 'Playbook 3 — Text-to-SQL',
    },
    {
      type: 'text',
      text: `**Shape:** instruction + schema in input → SQL output. **Seeds:** 100 questions your analysts actually ask. **Scale:** template more questions; execute SQL on a scratch DB to auto-filter. **Eval:** execution accuracy, not BLEU. **Start model:** code or instruct LLM.`,
    },
    {
      type: 'subHeader',
      text: 'Playbook 4 — Tool-calling agent',
    },
    {
      type: 'text',
      text: `**Shape:** ChatML with tool JSON. **Seeds:** 20 tools × 10 utterances each (including “don’t call a tool”). **Scale:** paraphrase; validate JSON schema. **Eval:** parse success + correct tool name/args. **Start model:** instruct model that already documents tools in-system.`,
    },
    {
      type: 'subHeader',
      text: 'Playbook 5 — RAG assistant over your docs',
    },
    {
      type: 'text',
      text: `**Shape:** instruction includes passages; output must answer only from them or say “not in context.” **Seeds:** chunk docs → write QAs. **Negative seeds:** questions with irrelevant chunks → refusal. **Eval:** faithfulness. **Start model:** instruct LLM; retrieval stays outside the model.`,
    },
    {
      type: 'subHeader',
      text: 'Playbook 6 — Classifier (urgent vs not, topic tags)',
    },
    {
      type: 'text',
      text: `**Shape:** text → label JSON. Prefer encoder fine-tune if you only need labels. **Seeds:** 500 human-labeled tickets. **Eval:** F1. Don’t use a 70B chat model unless you need explanations too.`,
    },
    {
      type: 'diagram',
      code: `flowchart LR
  Goal["Use-case goal"] --> Shape["Pick row shape"]
  Shape --> Seeds["10–50 gold seeds"]
  Seeds --> Scale["Expand + filter"]
  Scale --> Template["Apply model chat template"]
  Template --> Train["LoRA / SFT"]
  Train --> Eval["Task metrics"]
  Eval --> Seeds`,
    },
    {
      type: 'header',
      text: 'Step-by-step example 1 — build an instruction dataset',
    },
    {
      type: 'text',
      text: `**Goal:** a model that turns messy meeting notes into clean action items. **Shape:** Alpaca (single-turn). **File:** \`action_items.jsonl\`. Follow these steps exactly once — then repeat for your domain.`,
    },
    {
      type: 'subHeader',
      text: 'Step 1 — Write the behavior contract',
    },
    {
      type: 'code',
      code: `Contract:
When the user pastes meeting notes, extract concrete action items as bullets.
Include owner + deadline if present. Do not invent tasks. If none, say "No action items found."`,
    },
    {
      type: 'subHeader',
      text: 'Step 2 — Freeze the row schema',
    },
    {
      type: 'code',
      code: `// one line of JSONL =
{
  "instruction": "…what to do…",
  "input": "…meeting notes…",
  "output": "…bullets or No action items found.…"
}`,
    },
    {
      type: 'subHeader',
      text: 'Step 3 — Hand-write 15 gold rows',
    },
    {
      type: 'text',
      text: `Cover easy, hard, and empty cases. Example gold row:`,
    },
    {
      type: 'code',
      code: `{
  "instruction": "Extract action items as a bullet list. Include owner and deadline when stated. Do not invent tasks.",
  "input": "Ami will send the deck by Thursday. Raj owns vendor pricing. We skip the Friday sync — no owner.",
  "output": "- Ami: send deck by Thursday\\n- Raj: own vendor pricing"
}`,
    },
    {
      type: 'text',
      text: `Add at least: notes with no tasks → \`"No action items found."\` · vague chatter only · multiple owners · deadlines in relative words (“next week”).`,
    },
    {
      type: 'subHeader',
      text: 'Step 4 — Expand with a teacher model (optional)',
    },
    {
      type: 'text',
      text: `Prompt a strong model: “Write 10 new meeting-note → action-item pairs in the same JSON schema. Vary industries. Never invent owners.” Generate ~100–300 candidates.`,
    },
    {
      type: 'subHeader',
      text: 'Step 5 — Filter with a rubric',
    },
    {
      type: 'code',
      code: `Keep a row only if ALL are true:
[ ] Output is only bullets (or the exact empty phrase)
[ ] Every bullet appears in the notes (no inventions)
[ ] Owners/deadlines copied faithfully when present
[ ] No PII you would not ship
[ ] Valid JSON`,
    },
    {
      type: 'subHeader',
      text: 'Step 6 — Split train / dev',
    },
    {
      type: 'text',
      text: `e.g. 90% train, 10% dev. **Never** train on dev. Aim for ~200–2,000 kept rows before first LoRA on a 3B–8B model.`,
    },
    {
      type: 'subHeader',
      text: 'Step 7 — Train and check',
    },
    {
      type: 'text',
      text: `LoRA-SFT on your instruct/base model. Score on **dev**: % rows with zero invented tasks + format OK. Failures → rewrite gold → append → retrain.`,
    },
    {
      type: 'header',
      text: 'Step-by-step example 2 — build a chat dataset',
    },
    {
      type: 'text',
      text: `**Goal:** WidgetCo support assistant that asks one clarifying question, then answers with real policy. **Shape:** multi-turn chat (\`messages\` or ShareGPT). **File:** \`support_chat.jsonl\`.`,
    },
    {
      type: 'subHeader',
      text: 'Step 1 — Write the behavior contract + system line',
    },
    {
      type: 'code',
      code: `Contract:
Be brief and kind. Never invent policy.
If payment method is unknown, ask exactly one clarifying question.
After you know card vs wallet, give the matching timeline + next step.

System (fixed on every dialogue):
You are WidgetCo support. Use only the refund policy below.
Policy: card refunds 5–7 business days; wallet refunds 1–2 business days.
Escalate if day 8+ with no credit (ask for order id).`,
    },
    {
      type: 'subHeader',
      text: 'Step 2 — Freeze the chat schema',
    },
    {
      type: 'code',
      code: `{
  "messages": [
    { "role": "system", "content": "…" },
    { "role": "user", "content": "…" },
    { "role": "assistant", "content": "…" },
    { "role": "user", "content": "…" },
    { "role": "assistant", "content": "…" }
  ]
}`,
    },
    {
      type: 'subHeader',
      text: 'Step 3 — Hand-write 12 full dialogues (not single Q&A)',
    },
    {
      type: 'text',
      text: `Each dialogue must need **memory**: turn 2 depends on turn 1. Minimum coverage: card path, wallet path, angry user, “I don’t know” → escalate, off-topic → redirect.`,
    },
    {
      type: 'code',
      code: `{
  "messages": [
    {
      "role": "system",
      "content": "You are WidgetCo support. Use only the refund policy below. Policy: card refunds 5–7 business days; wallet refunds 1–2 business days. Escalate if day 8+ with no credit (ask for order id). Ask at most one clarifying question when needed."
    },
    { "role": "user", "content": "My refund is late." },
    {
      "role": "assistant",
      "content": "Sorry about the wait — was the payment card or wallet?"
    },
    { "role": "user", "content": "Card." },
    {
      "role": "assistant",
      "content": "Card refunds post in 5–7 business days. If it has been 8+ days with no credit, reply with your order id and I will escalate."
    }
  ]
}`,
    },
    {
      type: 'subHeader',
      text: 'Step 4 — Write the “trap” dialogues',
    },
    {
      type: 'text',
      text: `Add chats where the user never gives card/wallet — assistant must **keep asking** (once) or escalate, not invent a timeline. Add chats where the user already said “wallet” in turn 1 — assistant must **not** re-ask.`,
    },
    {
      type: 'subHeader',
      text: 'Step 5 — Expand carefully',
    },
    {
      type: 'text',
      text: `Paraphrase user lines (“refund delayed”, “still no money”). Keep assistant policy sentences almost fixed (copy from a policy sheet). Auto-generate only user paraphrases if you must; **human-edit** assistant lines.`,
    },
    {
      type: 'subHeader',
      text: 'Step 6 — Filter with a chat rubric',
    },
    {
      type: 'code',
      code: `Keep a dialogue only if ALL are true:
[ ] System policy present
[ ] Assistant never invents a timeline not in policy
[ ] Clarifying question appears only when needed
[ ] Later turns still respect earlier facts (card vs wallet)
[ ] No PII (emails, real order ids)
[ ] Valid JSON`,
    },
    {
      type: 'subHeader',
      text: 'Step 7 — Render with your model template',
    },
    {
      type: 'text',
      text: `Convert \`messages\` through Llama-3 / Mistral / Qwen \`apply_chat_template\`. Spot-check 5 rendered strings (special tokens present, roles in order). Train LoRA on the rendered text you will also use at serve time.`,
    },
    {
      type: 'subHeader',
      text: 'Step 8 — Eval like a conversation',
    },
    {
      type: 'text',
      text: `Script 10 held-out dialogues. Fail if: invents policy, forgets card/wallet, skips the clarifying question when required, or dumps a paragraph of unrelated help-center noise. Append failures as new gold chats.`,
    },
    {
      type: 'diagram',
      code: `flowchart TB
  subgraph InstEx["Instruction dataset"]
    A1["Contract"] --> A2["Alpaca rows"] --> A3["Filter facts"] --> A4["LoRA"]
  end
  subgraph ChatEx["Chat dataset"]
    B1["Contract + system"] --> B2["Full dialogues"] --> B3["Trap turns"] --> B4["Chat template"] --> B5["LoRA"]
  end`,
    },
    {
      type: 'header',
      text: 'From zero to JSONL this weekend',
    },
    {
      type: 'code',
      code: `# 1. Write the contract in one sentence
#    "When users ask about refunds, answer with policy + next step; never invent timelines."
#
# 2. Pick shape: instruction | chat | tools | preference
#
# 3. Hand-write 20 gold rows (painful = valuable)
#
# 4. Generate 200 candidates (teacher model) from those seeds
#
# 5. Keep only rows that pass a rubric checklist
#
# 6. Render with YOUR tokenizer chat_template; spot-check 10
#
# 7. Train LoRA; log failures in staging → become next 20 gold rows`,
    },
    {
      type: 'text',
      text: `**Rubric ideas:** correct facts, on-brand tone, valid JSON/SQL, no PII, uses prior turns (for chat), refuses when context missing (for RAG).`,
    },
    {
      type: 'text',
      text: `Neurosentia’s **Fine tune** workspace can browse packs and help build instruction pairs — same loop, less blank-file friction.`,
    },
    {
      type: 'header',
      text: 'After SFT: preference data',
    },
    {
      type: 'text',
      text: `When answers are “okay but not great,” add **chosen/rejected** pairs (UltraFeedback-style). SFT teaches skill; preference tuning teaches taste. Do it second.`,
    },
    {
      type: 'header',
      text: 'Synthetic data: superpower and trap',
    },
    {
      type: 'text',
      text: `Teacher models can expand seeds fast. Unfiltered synthetic rivers cause sameness, factual drift, and eval contamination. Generate wide, **filter hard**, mix human gold, check licenses.`,
    },
    {
      type: 'header',
      text: 'Takeaways',
    },
    {
      type: 'text',
      text: `**Instruction = one-shot tasks. Chat = multi-turn memory. Preference = taste after skill.**`,
    },
    {
      type: 'text',
      text: `**Write portable JSON; train on the model’s chat template.**`,
    },
    {
      type: 'text',
      text: `**Public packs** (Alpaca, Dolly, OASST, Magicoder, Glaive, SQL/RAG sets) are starting points — **your domain rows** win production.`,
    },
    {
      type: 'text',
      text: `**Playbooks + two full walkthroughs:** instruction (meeting → action items) and chat (support dialogues). Seeds → filter → template → LoRA → eval → more seeds.`,
    },
    {
      type: 'link',
      href: '#/fine-tune',
      text: 'Try: Fine-tune workspace — find & build datasets',
    },
    {
      type: 'link',
      href: '#/fine-tuning-techniques',
      text: 'Related: Fine-tuning techniques',
    },
    {
      type: 'link',
      href: '#/lora-fine-tuning',
      text: 'Related: LoRA fine-tuning deep dive',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/tatsu-lab/alpaca',
      text: 'Alpaca instruction dataset',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/databricks/databricks-dolly-15k',
      text: 'Databricks Dolly 15k',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/OpenAssistant/oasst1',
      text: 'OpenAssistant OASST1 (chat)',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/teknium/OpenHermes-2.5',
      text: 'OpenHermes 2.5',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K',
      text: 'Magicoder-OSS-Instruct (code)',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2',
      text: 'Glaive function-calling v2',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/b-mc2/sql-create-context',
      text: 'sql-create-context',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/neural-bridge/rag-dataset-12000',
      text: 'RAG dataset 12000',
    },
    {
      type: 'reference',
      href: 'https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized',
      text: 'UltraFeedback binarized (preference)',
    },
    {
      type: 'reference',
      href: 'https://zackproser.com/blog/how-to-create-a-custom-alpaca-dataset',
      text: 'How to create a custom Alpaca dataset',
    },
    {
      type: 'reference',
      href: 'https://wandb.ai/capecape/alpaca_ft/reports/How-to-Fine-Tune-an-LLM-Part-1-Preparing-a-Dataset-for-Instruction-Tuning--Vmlldzo1NTcxNzE2',
      text: 'W&B — preparing instruction-tuning data',
    },
    {
      type: 'reference',
      href: 'https://www.ruder.io/an-overview-of-instruction-tuning-data',
      text: 'Ruder — instruction-tuning data overview',
    },
    {
      type: 'reference',
      href: 'https://github.com/mlabonne/llm-datasets',
      text: 'mlabonne/llm-datasets',
    },
  ],
};

export default llmDatasetsContent;
