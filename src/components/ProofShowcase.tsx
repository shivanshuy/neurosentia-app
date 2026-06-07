import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

function ProofShowcase() {
  return (
    <Box className="proof-showcase">
      <Box className="proof-card">
        <Box className="proof-card-shine" aria-hidden="true" />
        <Box className="proof-card-body">
          <Box className="proof-card-icon" aria-hidden="true">
            <SmartToyOutlinedIcon />
          </Box>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
            Live demo
          </Typography>
          <Typography variant="h3" sx={{ color: 'text.primary', mb: 1 }}>
            Turing&apos;s Dream
          </Typography>
          <Typography variant="body2" className="home-section-intro" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
            Not a generic chat widget — a distinctive, capable bot we designed and shipped ourselves.
            Talk to it and see how we approach conversational AI: grounded responses, real integration, and craft in the details.
          </Typography>
          <RouterLink to="/chatterbug" className="proof-card-link">
            Try the chatbot
            <ArrowForwardRoundedIcon fontSize="small" />
          </RouterLink>
        </Box>
      </Box>
    </Box>
  );
}

export default ProofShowcase;
