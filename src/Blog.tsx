import { Box, Typography } from '@mui/material';

function Blog() {
  return (
    <Box className='app-content-page' sx={{ backgroundColor: '#f9f0ff', height: '200%' }}>
      <Box className='app-content-blog-page'>
        <Box className='app-content-blog-item'>
          <Box className='app-content-blog-item-title'>
            <Typography sx={{ color: '#f37b83', fontSize: '3em', fontWeight: 'bold' }}>Transformer Architecture</Typography>
          </Box>
          <Box className='app-content-blog-item-content'>
            <Typography sx={{ color: '#4a383b', fontSize: '1.5em' }}>Understanding the Basics</Typography>
          </Box>
        </Box>
        <Box className='app-content-blog-item'>
          <Box className='app-content-blog-item-title'>
            <Typography sx={{ color: '#f37b83', fontSize: '3em', fontWeight: 'bold' }}>Fine Tune Large Language Models</Typography>
          </Box>
          <Box className='app-content-blog-item-content'>
            <Typography sx={{ color: '#4a383b', fontSize: '1.5em' }}>Understanding the Basics</Typography>
          </Box>
        </Box>
      </Box>
    </Box >
  )
}

export default Blog