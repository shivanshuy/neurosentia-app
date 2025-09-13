import { Box, Typography } from '@mui/material';
import BlogHighlights from './components/BlogHighlights';

function Home() {
  return (
    <Box className='app-content-page' sx={{ height: '300%' }}>
      <Box className='app-content-home'>
        <Box className='app-content-home-left'>
          <Box className='app-content-home-left-content'>
            <Box sx={{
              backgroundImage: 'url("hero1.jpg")', // Replace with your image path
              backgroundSize: 'cover', // Adjust as needed (contain, 100% 100%, etc.)
              backgroundRepeat: 'no-repeat',
            }} className='app-content-home-left-image'>
            </Box>
            <Box className='app-content-home-left-banner-small'>
              <Typography sx={{ mt: 1, color: '#ffffff', fontSize: '3em', fontWeight: 'bold' }}>
                NEUROSENTIA
              </Typography>
              <Typography sx={{ pt: 1, color: '#d2d2d2', fontSize: '1.5em' }}>
                A space where algorithms think, stories breathe, and art inspires.
              </Typography>
              <Typography sx={{ color: '#d2d2d2', fontSize: '1.5em' }}>
                Building softwares at the intersection of AI, code, art, and ideas.
              </Typography>
            </Box>

            <Box className='app-content-home-left-banner'>
              <Typography sx={{ mt: 7, color: '#ffffff', fontSize: '4em', fontWeight: 'bold' }}>
                NEUROSENTIA
              </Typography>
              <Typography sx={{ pt: 2.5, color: '#d2d2d2', fontSize: '1.5em' }}>
                A space where algorithms think, stories breathe, and art inspires.
              </Typography>
              <Typography sx={{ color: '#d2d2d2', fontSize: '1.5em' }}>
                Building softwares at the intersection of AI, code, art, and ideas.
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{
          backgroundImage: 'url("hero1.jpg")', // Replace with your image path
          backgroundSize: 'cover', // Adjust as needed (contain, 100% 100%, etc.)
          backgroundRepeat: 'no-repeat',
        }} className='app-content-home-right'>
        </Box>
      </Box>
      <Box className='app-content-services'>
        <Typography sx={{ mt: '30px', color: '#f9f0ff', fontSize: '2.5em', fontWeight: 'bold' }}>
          Explore and Learn
        </Typography>
        <BlogHighlights></BlogHighlights>
      </Box>
      <Box className='app-content-contact'>
        <Box className='app-content-contact-left-content'>
          <Box sx={{
            backgroundImage: 'url("prof1.png")', // Replace with your image path
            backgroundSize: 'cover', // Adjust as needed (contain, 100% 100%, etc.)
            backgroundRepeat: 'no-repeat',
          }} className='app-content-contact-pic'>
          </Box>
        </Box>
        <Box className='app-content-contact-right-content'>
          <Typography sx={{ mt: '30px', color: '#f9f0ff', fontSize: '2.5em', fontWeight: 'bold' }}>
            Get in touch
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography sx={{ mt: 2, color: '#f9f0ff', fontSize: '1.5em', fontWeight: 'bold' }}>
              Email -
            </Typography>
            <Typography sx={{ ml: 1, mt: 2, pr: 7, color: '#b1b1b1', fontSize: '1.5em' }}>
              grafikaly@example.com
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography sx={{ mt: 2, color: '#f9f0ff', fontSize: '1.5em', fontWeight: 'bold' }}>
              Facebook -
            </Typography>
            <Typography sx={{ ml: 1, mt: 2, pr: 7, color: '#b1b1b1', fontSize: '1.5em' }}>
              grafikaly@example.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Home