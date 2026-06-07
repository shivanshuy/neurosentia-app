import { Box, Typography } from '@mui/material';

function Blog() {
  return (
    <Box className="app-content-page" sx={{ backgroundColor: '#f9f0ff', minHeight: '100%' }}>
      <Box className="app-content-blog-page">
        <Box className="app-content-blog-item">
          <Box className="app-content-blog-item-title">
            <Typography variant="h1" sx={{ color: 'primary.main', fontSize: { xs: '1.5rem', md: '1.875rem' } }}>
              Transformer Architecture
            </Typography>
          </Box>
          <Box className="app-content-blog-item-content">
            <Typography variant="subtitle1" sx={{ color: '#4a383b' }}>
              Understanding the Basics
            </Typography>
          </Box>
        </Box>
        <Box className="app-content-blog-item">
          <Box className="app-content-blog-item-title">
            <Typography variant="h1" sx={{ color: 'primary.main', fontSize: { xs: '1.5rem', md: '1.875rem' } }}>
              Fine Tune Large Language Models
            </Typography>
          </Box>
          <Box className="app-content-blog-item-content">
            <Typography variant="subtitle1" sx={{ color: '#4a383b' }}>
              Understanding the Basics
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Blog;
