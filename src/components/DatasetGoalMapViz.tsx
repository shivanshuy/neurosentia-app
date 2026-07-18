import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type Goal = 'chat' | 'code' | 'tools' | 'rag' | 'sql' | 'classify';

const GOALS: Array<{
  id: Goal;
  label: string;
  hook: string;
  datasets: Array<{ name: string; why: string }>;
  models: string;
  format: string;
}> = [
  {
    id: 'chat',
    label: 'Helpful chat',
    hook: 'You want the model to follow instructions like a polite coworker.',
    datasets: [
      { name: 'Alpaca / cleaned Alpaca', why: 'Classic instruction → response pairs' },
      { name: 'OpenAssistant / ShareGPT-style', why: 'Multi-turn conversational tone' },
      { name: 'LIMA', why: 'Small, carefully curated quality over quantity' },
      { name: 'UltraFeedback-style prefs', why: 'After SFT: chosen vs rejected for DPO' },
    ],
    models: 'Base → instruct (Llama, Mistral, Qwen, Phi…). Start from a base or lightly-tuned checkpoint; LoRA works well. Preference packs come *after* SFT.',
    format: 'Alpaca JSON or ShareGPT / ChatML turns; then chosen/rejected for DPO',
  },
  {
    id: 'code',
    label: 'Code & APIs',
    hook: 'You want completions, refactors, or OpenAPI-aware answers.',
    datasets: [
      { name: 'The Stack / code subsets', why: 'Pretrain or continued pretrain on code' },
      { name: 'Magicoder / evol-code style', why: 'Instruction tuning for coding tasks' },
      { name: 'Custom repo Q&A', why: 'Your codebase, your style' },
    ],
    models: 'Code-specialized bases (CodeLlama, DeepSeek-Coder, Qwen-Coder) or general instruct + LoRA on code pairs.',
    format: 'Instruction pairs; often include language tags in the prompt',
  },
  {
    id: 'tools',
    label: 'Function calling',
    hook: 'The model must emit structured tool calls, not just prose.',
    datasets: [
      { name: 'Glaive function-calling', why: 'Large synthetic tool-use dialogues' },
      { name: 'Function-calling Alpaca / ChatML packs', why: 'Schema-shaped outputs' },
    ],
    models: 'Instruct models with tool templates (Llama-3.1+, Mistral, Qwen). Fine-tune so the *format* sticks.',
    format: 'ChatML / ShareGPT with tool/function message roles',
  },
  {
    id: 'rag',
    label: 'RAG answers',
    hook: 'Ground answers in retrieved chunks — cite, don’t hallucinate.',
    datasets: [
      { name: 'RAG / context-QA packs', why: 'Question + passages → answer' },
      { name: 'Your docs as QA', why: 'Domain truth lives here' },
    ],
    models: 'Any solid instruct model; fine-tune teaches citation style and “use only context.”',
    format: 'Instruction with context in input; or chat with a system RAG policy',
  },
  {
    id: 'sql',
    label: 'Text → SQL',
    hook: 'Natural language in, query out.',
    datasets: [
      { name: 'sql-create-context', why: 'Question + schema → SQL' },
      { name: 'synthetic_text_to_sql', why: 'Broader synthetic coverage' },
    ],
    models: 'Instruct or code models; schema in the prompt is half the battle.',
    format: 'Alpaca-style: instruction + schema input → SQL output',
  },
  {
    id: 'classify',
    label: 'Classify / NER',
    hook: 'Labels, not essays — sentiment, topics, entities.',
    datasets: [
      { name: 'Classic GLUE-style / domain labels', why: 'Supervised classification' },
      { name: 'NER corpora', why: 'Span labels for names, places, dates' },
    ],
    models: 'Smaller encoders (BERT family) often beat giant LLMs for pure labeling; or LLM with constrained outputs.',
    format: 'Label fields or JSON; not long free-form chat',
  },
];

/**
 * Pick a training goal → see datasets, formats, and model fit.
 */
export default function DatasetGoalMapViz() {
  const [goal, setGoal] = useState<Goal>('chat');
  const active = GOALS.find((g) => g.id === goal) ?? GOALS[0];

  return (
    <Box className="ds-viz" aria-label="Dataset goal mapper">
      <Typography component="p" className="ds-viz__title">
        Pick the job → pick the data
      </Typography>
      <Typography component="p" className="ds-viz__sub">
        Datasets are not interchangeable. The goal decides the shape of each row — and which base
        model you should start from.
      </Typography>

      <div className="ds-viz__tabs" role="tablist">
        {GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={goal === g.id}
            className={`ds-viz__tab${goal === g.id ? ' is-on' : ''}`}
            onClick={() => setGoal(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="ds-viz__panel">
        <Typography component="p" className="ds-viz__hook">
          {active.hook}
        </Typography>
        <div className="ds-viz__grid">
          <div>
            <span className="ds-viz__label">Example datasets</span>
            <ul className="ds-viz__list">
              {active.datasets.map((d) => (
                <li key={d.name}>
                  <strong>{d.name}</strong> — {d.why}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="ds-viz__label">Model fit</span>
            <p className="ds-viz__body">{active.models}</p>
            <span className="ds-viz__label">Usual format</span>
            <p className="ds-viz__body">{active.format}</p>
          </div>
        </div>
      </div>
    </Box>
  );
}
