import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DatasetOutlinedIcon from '@mui/icons-material/DatasetOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import {
  CPU_FINE_TUNE_MODELS,
  FINE_TUNE_TECHNIQUES,
  cpuFitLabel,
  modelSizeLabel,
  optimalDatasetPreset,
  techniqueLabel,
  tuneRamForTechnique,
  type FineTuneTechniqueId,
} from '../../fineTuneCatalog';

type FineTuneLogLine = {
  level: 'info' | 'warn' | 'error';
};

type FineTuneTrainTabProps = {
  selectedModelId: string;
  onModelChange: (id: string) => void;
  technique: FineTuneTechniqueId;
  onTechniqueChange: (id: FineTuneTechniqueId) => void;
  datasetFile: File | null;
  onDatasetFileChange: (file: File | null) => void;
  onStart: () => void;
  onCreateOptimalDataset: () => void;
  appendLog: (text: string, level?: FineTuneLogLine['level']) => void;
};

export default function FineTuneTrainTab({
  selectedModelId,
  onModelChange,
  technique,
  onTechniqueChange,
  datasetFile,
  onDatasetFileChange,
  onStart,
  onCreateOptimalDataset,
  appendLog,
}: FineTuneTrainTabProps) {
  const selectedModel = CPU_FINE_TUNE_MODELS.find((m) => m.id === selectedModelId) ?? null;
  const availableTechniques = FINE_TUNE_TECHNIQUES.filter(
    (t) => selectedModel?.allowedTechniques.includes(t.id),
  );
  const activeTechnique = availableTechniques.find((t) => t.id === technique) ?? availableTechniques[0];
  const datasetPreset = selectedModel && activeTechnique
    ? optimalDatasetPreset(selectedModel, activeTechnique.id)
    : null;

  const handleDatasetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onDatasetFileChange(file);
    if (file) {
      appendLog(`Dataset selected: ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`);
    }
  };

  return (
    <Box className="fine-tune-page__panel fine-tune-page__panel--train">
      <Box className="fine-tune-page__controls">
        <FormControl className="fine-tune-page__field" size="medium" fullWidth>
          <InputLabel id="fine-tune-model-label">Base model</InputLabel>
          <Select
            labelId="fine-tune-model-label"
            id="fine-tune-model"
            value={selectedModelId}
            label="Base model"
            onChange={(e) => onModelChange(e.target.value)}
                renderValue={(value) => {
                  const model = CPU_FINE_TUNE_MODELS.find((m) => m.id === value);
                  return model?.ollamaTag !== '—' ? model?.ollamaTag : model?.name ?? value;
                }}
              >
                {CPU_FINE_TUNE_MODELS.map((model) => (
                  <MenuItem key={model.id} value={model.id} sx={{ py: 1.1, alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {model.ollamaTag !== '—' ? model.ollamaTag : model.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                        {model.name} · {model.params} · {model.diskHint} · {cpuFitLabel(model.cpuFit)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
          </Select>
        </FormControl>

        <FormControl className="fine-tune-page__field" size="medium" fullWidth disabled={!selectedModel}>
          <InputLabel id="fine-tune-technique-label">Technique</InputLabel>
          <Select
            labelId="fine-tune-technique-label"
            id="fine-tune-technique"
            value={activeTechnique?.id ?? ''}
            label="Technique"
            onChange={(e) => onTechniqueChange(e.target.value as FineTuneTechniqueId)}
            renderValue={(value) => FINE_TUNE_TECHNIQUES.find((t) => t.id === value)?.label ?? value}
          >
            {availableTechniques.map((item) => (
              <MenuItem key={item.id} value={item.id} sx={{ py: 1.1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.label}
                    {item.id === selectedModel?.guidance.recommendedTechnique ? ' · recommended for this model' : ''}
                    {item.recommended && item.id !== selectedModel?.guidance.recommendedTechnique ? ' · general default' : ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.summary}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedModel && (
        <details className="fine-tune-page__guidance">
          <summary className="fine-tune-page__guidance-summary">
            <span className="fine-tune-page__guidance-summary-label">Model guide</span>
            <span className="fine-tune-page__pipe" aria-hidden>|</span>
            <span>{selectedModel.ollamaTag !== '—' ? selectedModel.ollamaTag : selectedModel.name}</span>
            <span className="fine-tune-page__pipe" aria-hidden>|</span>
            <span>{modelSizeLabel(selectedModel)}</span>
            <span className="fine-tune-page__pipe" aria-hidden>|</span>
            <span>
              tune {tuneRamForTechnique(selectedModel, activeTechnique?.id ?? selectedModel.guidance.recommendedTechnique)}
            </span>
            <span className="fine-tune-page__pipe" aria-hidden>|</span>
            <span>infer {selectedModel.guidance.inferRam}</span>
          </summary>
          <Box className="fine-tune-page__guidance-body">
            <Box className="fine-tune-page__guidance-item">
              <Typography className="fine-tune-page__guidance-k" component="span">Best technique</Typography>
              <Typography className="fine-tune-page__guidance-v" component="span">
                {techniqueLabel(selectedModel.guidance.recommendedTechnique)}
                <span className="fine-tune-page__guidance-inline-muted"> — {selectedModel.guidance.techniqueWhy}</span>
              </Typography>
            </Box>
            <Box className="fine-tune-page__guidance-item">
              <Typography className="fine-tune-page__guidance-k" component="span">RAM to tune</Typography>
              <Typography className="fine-tune-page__guidance-v" component="span">
                {tuneRamForTechnique(selectedModel, activeTechnique?.id ?? selectedModel.guidance.recommendedTechnique)}
                {' · '}
                {techniqueLabel(activeTechnique?.id ?? selectedModel.guidance.recommendedTechnique)}
                {selectedModel.guidance.trainRamFull && (
                  <span className="fine-tune-page__guidance-inline-muted">
                    {' · '}
                    {activeTechnique?.id === 'full-sft'
                      ? `LoRA ${selectedModel.guidance.trainRamLora}`
                      : `full SFT ${selectedModel.guidance.trainRamFull}`}
                  </span>
                )}
              </Typography>
            </Box>
            <Box className="fine-tune-page__guidance-item">
              <Typography className="fine-tune-page__guidance-k" component="span">Tune / base</Typography>
              <Typography className="fine-tune-page__guidance-v" component="span">
                <span className="fine-tune-page__guidance-inline-muted">Tune:</span> {selectedModel.guidance.tuneWhen}
                <span className="fine-tune-page__guidance-inline-muted"> · Base:</span> {selectedModel.guidance.inferWhen}
              </Typography>
            </Box>
            <Box className="fine-tune-page__guidance-item">
              <Typography className="fine-tune-page__guidance-k" component="span">Dataset</Typography>
              <Typography className="fine-tune-page__guidance-v" component="span">
                {selectedModel.guidance.datasetNeed}
              </Typography>
            </Box>
          </Box>
        </details>
      )}

      {activeTechnique && (
        <Typography className="fine-tune-page__technique-hint">
          {activeTechnique.summary} · Format: {activeTechnique.datasetFormat}
        </Typography>
      )}

      {selectedModel && datasetPreset && (
        <Box className="fine-tune-page__optimal-dataset">
          <Button
            variant="outlined"
            size="small"
            startIcon={<DatasetOutlinedIcon />}
            onClick={onCreateOptimalDataset}
            className="fine-tune-page__optimal-dataset-btn"
          >
            Create dataset for this model
          </Button>
          <Typography className="fine-tune-page__optimal-dataset-hint" component="div">
            <span>{datasetPreset.formatLabel}</span>
            <span className="fine-tune-page__pipe" aria-hidden>|</span>
            <span>~{datasetPreset.maxPairs} pairs</span>
          </Typography>
        </Box>
      )}

      <Box className="fine-tune-page__upload">
        <CloudUploadOutlinedIcon className="fine-tune-page__upload-icon" aria-hidden />
        <Typography className="fine-tune-page__upload-line" component="div">
          <span className="fine-tune-page__upload-title">Training dataset</span>
          <span className="fine-tune-page__pipe" aria-hidden>|</span>
          <span className="fine-tune-page__upload-hint">JSONL, CSV, or plain text</span>
          <span className="fine-tune-page__pipe" aria-hidden>|</span>
          {datasetFile ? (
            <span className="fine-tune-page__file-name">{datasetFile.name}</span>
          ) : (
            <span className="fine-tune-page__file-placeholder">No file selected</span>
          )}
        </Typography>
        <Button
          variant="outlined"
          component="label"
          size="small"
          className="fine-tune-page__upload-btn"
          startIcon={<AutoAwesomeOutlinedIcon />}
        >
          Choose file
          <input
            type="file"
            hidden
            accept=".jsonl,.json,.csv,.txt"
            onChange={handleDatasetChange}
          />
        </Button>
      </Box>

      <Box className="fine-tune-page__actions">
        <Button
          variant="contained"
          size="medium"
          startIcon={<MemoryOutlinedIcon />}
          onClick={onStart}
          className="fine-tune-page__submit"
        >
          Start fine-tune
        </Button>
            {selectedModel && activeTechnique && (
              <Typography className="fine-tune-page__actions-hint" component="div">
                <span>{selectedModel.ollamaTag !== '—' ? selectedModel.ollamaTag : selectedModel.name}</span>
                <span className="fine-tune-page__pipe" aria-hidden>|</span>
                <span>{activeTechnique.label}</span>
              </Typography>
            )}
      </Box>
    </Box>
  );
}
