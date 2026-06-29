import Box from '@mui/material/Box';
import type { SearchSignal } from '../chat/types';
import { signalLabel } from '../chat/confidence';

type ConfidenceStripProps = {
  signal: SearchSignal;
};

export default function ConfidenceStrip({ signal }: ConfidenceStripProps) {
  return (
    <Box className="crt-confidence-strip" data-signal={signal}>
      {signalLabel(signal)}
    </Box>
  );
}
