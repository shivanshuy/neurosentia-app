import { Box, Typography } from '@mui/material';

type SectionHeadingProps = {
  children: React.ReactNode;
};

function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <Box sx={{ mt: { xs: 3, md: 4 } }}>
      <Box
        sx={{
          width: 48,
          height: 3,
          bgcolor: 'primary.main',
          mb: 2,
          borderRadius: 1,
        }}
      />
      <Typography variant="h2" color="text.primary">
        {children}
      </Typography>
    </Box>
  );
}

export default SectionHeading;
