import Box from '@mui/material/Box';

type AudioChannelProps = {
  active: boolean;
  level: number;
};

export default function AudioChannel({ active, level }: AudioChannelProps) {
  const bars = Array.from({ length: 12 }, (_, i) => {
    const threshold = (i + 1) / 12;
    return active && level >= threshold * 0.85;
  });

  return (
    <Box className={`crt-audio-channel${active ? ' crt-audio-channel--live' : ''}`} aria-live="polite">
      <span className="crt-audio-label">AUDIO CH · TURING OUT</span>
      <Box className="crt-vu-meter" aria-hidden="true">
        {bars.map((on, index) => (
          <span key={index} className={`crt-vu-bar${on ? ' crt-vu-bar--on' : ''}`} />
        ))}
      </Box>
    </Box>
  );
}
