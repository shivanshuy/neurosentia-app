import * as React from 'react';
import Box from '@mui/material/Box';
import { FaPlus, FaThumbtack, FaTimes } from 'react-icons/fa';

type MemoryPinsPanelProps = {
  pins: string[];
  onChange: (pins: string[]) => void;
};

export default function MemoryPinsPanel({ pins, onChange }: MemoryPinsPanelProps) {
  const [draft, setDraft] = React.useState('');

  const addPin = () => {
    const text = draft.trim();
    if (!text || pins.includes(text)) return;
    onChange([...pins, text]);
    setDraft('');
  };

  return (
    <Box className="crt-panel crt-pins-panel">
      <Box className="crt-pins-header">
        <FaThumbtack aria-hidden="true" />
        <span>MEMORY PINS</span>
      </Box>
      <p className="crt-pins-hint">Pinned facts are injected into every run (not shown in chat).</p>
      <ul className="crt-pins-list">
        {pins.length === 0 && <li className="crt-pins-empty">NO PINS YET.</li>}
        {pins.map((pin) => (
          <li key={pin} className="crt-pin-item">
            <span>{pin}</span>
            <button type="button" className="crt-pin-remove" onClick={() => onChange(pins.filter((p) => p !== pin))}>
              <FaTimes />
            </button>
          </li>
        ))}
      </ul>
      <Box className="crt-pins-add">
        <input
          className="crt-pins-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="We use Postgres..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addPin();
            }
          }}
        />
        <button type="button" className="crt-recording-action-btn" onClick={addPin}>
          <FaPlus /> PIN
        </button>
      </Box>
    </Box>
  );
}
