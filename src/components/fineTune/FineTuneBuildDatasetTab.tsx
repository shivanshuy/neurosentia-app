import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {
  getDatasetBuildJob,
  startDatasetBuild,
  startDatasetBuildFromFile,
  DatasetBuildJobNotFoundError,
  type DatasetBuildFormat,
  type DatasetBuildRow,
} from '../../fineTune/datasetApi';
import { rowsToJsonlFile } from '../../datasetCatalog';

type FineTuneBuildDatasetTabProps = {
  onUseDataset: (file: File) => void;
  appendLog: (text: string, level?: 'info' | 'warn' | 'error') => void;
  initialFormat?: DatasetBuildFormat;
  initialMaxPairs?: number;
  targetModelLabel?: string;
};

const FORMAT_LABELS: Record<DatasetBuildFormat, string> = {
  alpaca: 'Alpaca (instruction / input / output)',
  sharegpt: 'ShareGPT (messages)',
  embedding: 'Embedding (query / positive)',
};

export default function FineTuneBuildDatasetTab({
  onUseDataset,
  appendLog,
  initialFormat = 'alpaca',
  initialMaxPairs = 20,
  targetModelLabel,
}: FineTuneBuildDatasetTabProps) {
  const [sourceText, setSourceText] = React.useState('');
  const [format, setFormat] = React.useState<DatasetBuildFormat>(initialFormat);
  const [maxPairs, setMaxPairs] = React.useState(initialMaxPairs);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<DatasetBuildRow[]>([]);
  const [building, setBuilding] = React.useState(false);
  const seenMessagesRef = React.useRef(0);

  React.useEffect(() => {
    if (!jobId) return undefined;

    let cancelled = false;
    const poll = async () => {
      try {
        const job = await getDatasetBuildJob(jobId);
        if (cancelled) return;

        if (job.messages.length > seenMessagesRef.current) {
          job.messages.slice(seenMessagesRef.current).forEach((msg) => appendLog(msg));
          seenMessagesRef.current = job.messages.length;
        }

        setRows(job.rows);

        if (job.status === 'completed' || job.status === 'failed') {
          setBuilding(false);
          if (job.status === 'failed' && job.error) {
            appendLog(job.error, 'error');
          }
        }
      } catch (error) {
        if (!cancelled) {
          setBuilding(false);
          if (error instanceof DatasetBuildJobNotFoundError) {
            appendLog(error.message, 'warn');
            setJobId(null);
            return;
          }
          const message = error instanceof Error ? error.message : 'Build poll failed';
          appendLog(message, 'error');
        }
      }
    };

    poll();
    const timer = window.setInterval(poll, 1200);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [jobId, appendLog]);

  const handleBuildFromText = async () => {
    const text = sourceText.trim();
    if (!text) {
      appendLog('Paste source text or upload a .txt / .md file first.', 'warn');
      return;
    }
    setBuilding(true);
    setRows([]);
    seenMessagesRef.current = 0;
    try {
      const { job_id } = await startDatasetBuild({
        text,
        format,
        max_pairs: maxPairs,
        source_name: 'pasted-text',
      });
      setJobId(job_id);
      appendLog(`Dataset build started (job ${job_id.slice(0, 8)}…).`);
    } catch (error) {
      setBuilding(false);
      const message = error instanceof Error ? error.message : 'Build failed to start';
      appendLog(message, 'error');
    }
  };

  const handleBuildFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setBuilding(true);
    setRows([]);
    seenMessagesRef.current = 0;
    try {
      const { job_id } = await startDatasetBuildFromFile(file, format, maxPairs);
      setJobId(job_id);
      appendLog(`Dataset build started from ${file.name}.`);
    } catch (error) {
      setBuilding(false);
      const message = error instanceof Error ? error.message : 'Upload build failed';
      appendLog(message, 'error');
    }
  };

  const handleExport = () => {
    if (rows.length === 0) {
      appendLog('No rows to export yet.', 'warn');
      return;
    }
    const file = rowsToJsonlFile(rows, `built-dataset-${format}.jsonl`);
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
    appendLog(`Exported ${rows.length} row(s) to ${file.name}`);
  };

  const handleUseForTraining = () => {
    if (rows.length === 0) {
      appendLog('Build or import rows before using for training.', 'warn');
      return;
    }
    const file = rowsToJsonlFile(rows, `built-dataset-${format}.jsonl`);
    onUseDataset(file);
    appendLog(`Using built dataset (${rows.length} rows) for training.`);
  };

  const previewLabel = (row: DatasetBuildRow): string => {
    if (typeof row.instruction === 'string') return row.instruction;
    if (typeof row.query === 'string') return row.query;
    const messages = row.messages;
    if (Array.isArray(messages) && messages[0] && typeof messages[0] === 'object') {
      const first = messages[0] as { content?: string };
      return first.content ?? '—';
    }
    return '—';
  };

  const previewAnswer = (row: DatasetBuildRow): string => {
    if (typeof row.output === 'string') return row.output;
    if (typeof row.positive === 'string') return row.positive;
    const messages = row.messages;
    if (Array.isArray(messages) && messages[1] && typeof messages[1] === 'object') {
      const second = messages[1] as { content?: string };
      return second.content ?? '—';
    }
    return '—';
  };

  return (
    <Box className="fine-tune-page__panel fine-tune-page__panel--scroll">
      <Typography className="fine-tune-page__section-title">Build a dataset</Typography>
      <Typography className="fine-tune-page__section-lede">
        Paste notes or upload text — neurosentia-serve uses Ollama to generate instruction pairs.
        {targetModelLabel ? (
          <>
            {' '}
            Preselected for <strong>{targetModelLabel}</strong>: {FORMAT_LABELS[format]}.
          </>
        ) : null}
      </Typography>

      <Box className="fine-tune-page__build-controls">
        <FormControl className="fine-tune-page__field" size="small" fullWidth>
          <InputLabel id="build-format-label">Output format</InputLabel>
          <Select
            labelId="build-format-label"
            value={format}
            label="Output format"
            onChange={(e) => setFormat(e.target.value as DatasetBuildFormat)}
          >
            {(Object.keys(FORMAT_LABELS) as DatasetBuildFormat[]).map((key) => (
              <MenuItem key={key} value={key}>{FORMAT_LABELS[key]}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Max pairs"
          type="number"
          size="small"
          value={maxPairs}
          onChange={(e) => setMaxPairs(Math.max(1, Math.min(200, Number(e.target.value) || 20)))}
          inputProps={{ min: 1, max: 200 }}
          className="fine-tune-page__field"
        />
      </Box>

      <TextField
        multiline
        minRows={5}
        maxRows={10}
        fullWidth
        placeholder="Paste documentation, FAQ, or notes here…"
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        className="fine-tune-page__build-text"
        disabled={building}
      />

      <Box className="fine-tune-page__build-actions">
        <Button
          variant="contained"
          startIcon={<AutoFixHighOutlinedIcon />}
          onClick={handleBuildFromText}
          disabled={building}
        >
          {building ? 'Building…' : 'Generate from text'}
        </Button>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadOutlinedIcon />}
          disabled={building}
        >
          Upload .txt / .md
          <input type="file" hidden accept=".txt,.md,.markdown,.text" onChange={handleBuildFromFile} />
        </Button>
      </Box>

      {rows.length > 0 && (
        <>
          <Box className="fine-tune-page__preview-head">
            <Typography className="fine-tune-page__section-title fine-tune-page__section-title--spaced">
              Preview ({rows.length} rows)
            </Typography>
            <Box className="fine-tune-page__preview-actions">
              <Button size="small" variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExport}>
                Export JSONL
              </Button>
              <Button size="small" variant="contained" onClick={handleUseForTraining}>
                Use for training
              </Button>
            </Box>
          </Box>
          <Box className="fine-tune-page__preview-table">
            {rows.slice(0, 12).map((row, index) => (
              <Box key={`row-${index}`} className="fine-tune-page__preview-row">
                <Typography className="fine-tune-page__preview-q">{previewLabel(row)}</Typography>
                <Typography className="fine-tune-page__preview-a">{previewAnswer(row)}</Typography>
              </Box>
            ))}
            {rows.length > 12 && (
              <Typography className="fine-tune-page__preview-more">
                + {rows.length - 12} more row(s) — export JSONL to see all.
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
