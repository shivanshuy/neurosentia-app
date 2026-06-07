import type { ReactNode } from 'react';
import { Box } from '@mui/material';

type TopicIconProps = {
  children: ReactNode;
};

function TopicIcon({ children }: TopicIconProps) {
  return (
    <Box className="topic-icon" aria-hidden="true">
      <span className="topic-icon-ring" />
      {children}
    </Box>
  );
}

export default TopicIcon;
