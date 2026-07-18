import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import SectionHeading from '../components/SectionHeading';
import FineTuneBuildDatasetTab from '../components/fineTune/FineTuneBuildDatasetTab';
import FineTuneFindDatasetTab from '../components/fineTune/FineTuneFindDatasetTab';
import FineTuneTrainTab from '../components/fineTune/FineTuneTrainTab';
import {
  CPU_FINE_TUNE_MODELS,
  FINE_TUNE_TECHNIQUES,
  optimalDatasetPreset,
  type FineTuneTechniqueId,
  type OptimalDatasetFormat,
} from '../fineTuneCatalog';

export type FineTuneTab = 'train' | 'find' | 'build';

type FineTuneLogLine = {
  id: string;
  at: string;
  text: string;
  level: 'info' | 'warn' | 'error';
};

function formatLogTime(date = new Date()) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function FineTunePage() {
  const [activeTab, setActiveTab] = React.useState<FineTuneTab>('train');
  const [selectedModelId, setSelectedModelId] = React.useState(CPU_FINE_TUNE_MODELS[0]?.id ?? '');
  const [technique, setTechnique] = React.useState<FineTuneTechniqueId>('lora-sft');
  const [datasetFile, setDatasetFile] = React.useState<File | null>(null);
  const [buildFormat, setBuildFormat] = React.useState<OptimalDatasetFormat>('alpaca');
  const [buildMaxPairs, setBuildMaxPairs] = React.useState(20);
  const [buildPresetKey, setBuildPresetKey] = React.useState(0);
  const [progressLog, setProgressLog] = React.useState<FineTuneLogLine[]>([]);
  const logEndRef = React.useRef<HTMLDivElement | null>(null);

  const handleModelChange = React.useCallback((id: string) => {
    setSelectedModelId(id);
    const model = CPU_FINE_TUNE_MODELS.find((m) => m.id === id);
    if (
      model?.guidance.recommendedTechnique
      && model.allowedTechniques.includes(model.guidance.recommendedTechnique)
    ) {
      setTechnique(model.guidance.recommendedTechnique);
    }
  }, []);

  const appendLog = React.useCallback((text: string, level: FineTuneLogLine['level'] = 'info') => {
    setProgressLog((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, at: formatLogTime(), text, level },
    ]);
  }, []);

  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [progressLog]);

  const selectedModel = CPU_FINE_TUNE_MODELS.find((m) => m.id === selectedModelId) ?? null;
  const availableTechniques = FINE_TUNE_TECHNIQUES.filter(
    (t) => selectedModel?.allowedTechniques.includes(t.id),
  );
  const activeTechnique = availableTechniques.find((t) => t.id === technique) ?? availableTechniques[0];

  React.useEffect(() => {
    if (!selectedModel) return;
    if (!selectedModel.allowedTechniques.includes(technique)) {
      setTechnique(selectedModel.allowedTechniques[0] ?? 'lora-sft');
    }
  }, [selectedModel, technique]);

  const handleUseDataset = React.useCallback((file: File) => {
    setDatasetFile(file);
    setActiveTab('train');
  }, []);

  const handleCreateOptimalDataset = React.useCallback(() => {
    if (!selectedModel || !activeTechnique) {
      appendLog('Select a model first.', 'warn');
      return;
    }
    const preset = optimalDatasetPreset(selectedModel, activeTechnique.id);
    setBuildFormat(preset.format);
    setBuildMaxPairs(preset.maxPairs);
    setBuildPresetKey((k) => k + 1);
    setActiveTab('build');
    const modelLabel = selectedModel.ollamaTag !== '—' ? selectedModel.ollamaTag : selectedModel.name;
    appendLog(
      `Build data opened for ${modelLabel}: ${preset.formatLabel}, ~${preset.maxPairs} pairs. ${preset.reason}`,
    );
  }, [selectedModel, activeTechnique, appendLog]);

  const handleStart = () => {
    if (!selectedModel || !datasetFile || !activeTechnique) {
      appendLog('Select a model, technique, and dataset file to continue.', 'warn');
      setActiveTab('train');
      return;
    }
    appendLog(
      `Queued ${selectedModel.ollamaTag !== '—' ? selectedModel.ollamaTag : selectedModel.name} | ${activeTechnique.label} | "${datasetFile.name}". `
      + 'Waiting for training stream from neurosentia-serve…',
    );
  };

  return (
    <Box className="app-content-page fine-tune-page">
      <Box className="fine-tune-page__inner">
        <Box className="fine-tune-page__header">
          <SectionHeading>Fine tune your LLM</SectionHeading>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_e, value: FineTuneTab) => setActiveTab(value)}
          className="fine-tune-page__tabs"
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab value="train" label="Train" />
          <Tab value="find" label="Find data" />
          <Tab value="build" label="Build data" />
        </Tabs>

        {activeTab === 'train' && (
          <FineTuneTrainTab
            selectedModelId={selectedModelId}
            onModelChange={handleModelChange}
            technique={technique}
            onTechniqueChange={setTechnique}
            datasetFile={datasetFile}
            onDatasetFileChange={setDatasetFile}
            onStart={handleStart}
            onCreateOptimalDataset={handleCreateOptimalDataset}
            appendLog={appendLog}
          />
        )}

        {activeTab === 'find' && activeTechnique && (
          <FineTuneFindDatasetTab
            activeTechnique={activeTechnique.id}
            onUseSample={handleUseDataset}
            appendLog={appendLog}
          />
        )}

        {activeTab === 'build' && (
          <FineTuneBuildDatasetTab
            key={buildPresetKey}
            initialFormat={buildFormat}
            initialMaxPairs={buildMaxPairs}
            targetModelLabel={
              selectedModel
                ? (selectedModel.ollamaTag !== '—' ? selectedModel.ollamaTag : selectedModel.name)
                : undefined
            }
            onUseDataset={handleUseDataset}
            appendLog={appendLog}
          />
        )}

        <Box className="fine-tune-page__log" aria-live="polite" aria-label="Fine-tune progress log">
          <Typography className="fine-tune-page__log-title" component="h2">
            Activity log
          </Typography>
          <Box className="fine-tune-page__log-body" role="log">
            {progressLog.length === 0 ? (
              <Typography className="fine-tune-page__log-empty">
                Training and dataset build messages appear here.
              </Typography>
            ) : (
              progressLog.map((line) => (
                <Box key={line.id} className={`fine-tune-page__log-line fine-tune-page__log-line--${line.level}`}>
                  <span className="fine-tune-page__log-time">{line.at}</span>
                  <span className="fine-tune-page__log-text">{line.text}</span>
                </Box>
              ))
            )}
            <div ref={logEndRef} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
