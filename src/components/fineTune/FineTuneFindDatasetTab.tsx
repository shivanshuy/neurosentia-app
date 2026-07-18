import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import {
  CURATED_DATASETS,
  DATASET_GOAL_LABELS,
  DATASET_TEMPLATES,
  downloadTemplate,
  fetchSampleAsFile,
  type CuratedDataset,
  type DatasetGoal,
} from '../../datasetCatalog';
import type { FineTuneTechniqueId } from '../../fineTuneCatalog';

type FineTuneFindDatasetTabProps = {
  activeTechnique: FineTuneTechniqueId;
  onUseSample: (file: File) => void;
  appendLog: (text: string, level?: 'info' | 'warn' | 'error') => void;
};

export default function FineTuneFindDatasetTab({
  activeTechnique,
  onUseSample,
  appendLog,
}: FineTuneFindDatasetTabProps) {
  const [goalFilter, setGoalFilter] = React.useState<DatasetGoal | 'all'>('all');
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const filtered = CURATED_DATASETS.filter((item) => {
    if (goalFilter !== 'all' && item.goal !== goalFilter) return false;
    return item.techniques.includes(activeTechnique);
  });

  const templates = DATASET_TEMPLATES.filter(
    (t) => t.technique === activeTechnique || (activeTechnique === 'full-sft' && t.id === 'full-sft-text'),
  );

  const handleUseSample = async (dataset: CuratedDataset) => {
    if (!dataset.localSampleId) return;
    setLoadingId(dataset.id);
    try {
      const file = await fetchSampleAsFile(dataset.localSampleId);
      onUseSample(file);
      appendLog(`Loaded sample dataset: ${file.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load sample';
      appendLog(message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownloadTemplate = async (filename: string, label: string) => {
    try {
      await downloadTemplate(filename);
      appendLog(`Downloaded template: ${label}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Template download failed';
      appendLog(message, 'error');
    }
  };

  return (
    <Box className="fine-tune-page__panel fine-tune-page__panel--scroll">
      <Typography className="fine-tune-page__section-title">Find a dataset</Typography>
      <Typography className="fine-tune-page__section-lede">
        Curated open datasets for CPU-friendly fine-tuning. Use a bundled sample to try training, or open the full set on Hugging Face.
      </Typography>

      <Box className="fine-tune-page__filter-row">
        <Chip
          size="small"
          label="All"
          onClick={() => setGoalFilter('all')}
          className={goalFilter === 'all' ? 'fine-tune-page__filter-chip fine-tune-page__filter-chip--active' : 'fine-tune-page__filter-chip'}
        />
        {(Object.keys(DATASET_GOAL_LABELS) as DatasetGoal[]).map((goal) => (
          <Chip
            key={goal}
            size="small"
            label={DATASET_GOAL_LABELS[goal]}
            onClick={() => setGoalFilter(goal)}
            className={goalFilter === goal ? 'fine-tune-page__filter-chip fine-tune-page__filter-chip--active' : 'fine-tune-page__filter-chip'}
          />
        ))}
      </Box>

      <Box className="fine-tune-page__dataset-list">
        {filtered.map((dataset) => (
          <Box key={dataset.id} className="fine-tune-page__dataset-card">
            <Box className="fine-tune-page__dataset-card-head">
              <Typography className="fine-tune-page__dataset-name">{dataset.name}</Typography>
              <Chip size="small" label={DATASET_GOAL_LABELS[dataset.goal]} className="fine-tune-page__chip" />
            </Box>
            <Typography className="fine-tune-page__dataset-desc">{dataset.description}</Typography>
            <Typography className="fine-tune-page__dataset-meta">
              {dataset.sizeHint} · {dataset.license}
              {dataset.commercialOk ? ' · commercial OK' : ''}
              {' · CPU sample: '}{dataset.cpuSampleRows}
            </Typography>
            <Box className="fine-tune-page__dataset-actions">
              {dataset.localSampleId && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PlayArrowOutlinedIcon />}
                  disabled={loadingId === dataset.id}
                  onClick={() => handleUseSample(dataset)}
                >
                  Use sample
                </Button>
              )}
              {dataset.hfUrl && (
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  href={dataset.hfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<OpenInNewOutlinedIcon />}
                >
                  Hugging Face
                </Button>
              )}
            </Box>
          </Box>
        ))}
        {filtered.length === 0 && (
          <Typography className="fine-tune-page__log-empty">No datasets match this technique and filter.</Typography>
        )}
      </Box>

      <Typography className="fine-tune-page__section-title fine-tune-page__section-title--spaced">Format templates</Typography>
      <Box className="fine-tune-page__template-list">
        {templates.map((template) => (
          <Box key={template.id} className="fine-tune-page__template-row">
            <Box>
              <Typography className="fine-tune-page__template-label">{template.label}</Typography>
              <Typography className="fine-tune-page__template-desc">{template.description}</Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              onClick={() => handleDownloadTemplate(template.filename, template.label)}
            >
              Download
            </Button>
          </Box>
        ))}
      </Box>

      <Box className="fine-tune-page__prep-guide">
        <Typography className="fine-tune-page__section-title fine-tune-page__section-title--spaced">How to prepare data</Typography>
        <ul className="fine-tune-page__prep-list">
          <li>Start with <strong>1k–10k clean rows</strong> for models under 1B on CPU — quality beats size.</li>
          <li>Match format to technique: Alpaca JSONL for LoRA, query/positive pairs for embeddings.</li>
          <li>Remove duplicates, trim very long examples, and check the dataset license before commercial use.</li>
          <li>Use <strong>Find data → Use sample</strong> or <strong>Build data</strong> to generate JSONL from your docs.</li>
        </ul>
      </Box>
    </Box>
  );
}
