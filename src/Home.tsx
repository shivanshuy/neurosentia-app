import { Box, Typography } from '@mui/material';
import BlogHighlights from './components/BlogHighlights';
import logoIcon from './assets/logo-icon.png';
import logoText from './assets/logo-text.png';

type HomeBrandRowProps = {
  iconWidth: string;
  wordmarkHeight: string;
  marginLeft: number;
};

function HomeDeepThoughtSection() {
  return (
    <>
      <Typography sx={{ pt: 5, color: '#f9f0ff', fontSize: '1.5em', fontWeight: 'bold', fontStyle: 'italic' }}>
        In search of The Ultimate Question
      </Typography>
      <Typography sx={{ pt: 2, color: '#d2d2d2', fontSize: '1.2em', fontStyle: 'italic' }}>
        A race of hyper-intelligent, pan-dimensional beings build a supercomputer named Deep Thought to calculate the
        &quot;Answer to the Ultimate Question of Life, the Universe, and Everything.&quot;
      </Typography>
      <Typography sx={{ pt: 1.5, color: '#d2d2d2', fontSize: '1.2em', fontStyle: 'italic' }}>
        After 7.5 million years of processing, the computer reveals the answer is 42.
      </Typography>
      <Typography sx={{ pt: 1.5, color: '#d2d2d2', fontSize: '1.2em', fontStyle: 'italic' }}>
        The beings are completely bewildered by the answer because they do not know what the actual Ultimate Question is.
      </Typography>
      <Typography sx={{ pt: 2, color: '#b1b1b1', fontSize: '1.25em', fontStyle: 'italic' }}>
        Douglas Adams
      </Typography>
    </>
  );
}

function HomeBrandRow({ iconWidth, wordmarkHeight, marginLeft }: HomeBrandRowProps) {
  return (
    <Box
      sx={{
        mt: 2,
        ml: marginLeft,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        component="img"
        src={logoIcon}
        alt=""
        aria-hidden="true"
        sx={{ width: iconWidth, height: 'auto', display: 'block', mixBlendMode: 'lighten' }}
      />
      <Box
        component="img"
        src={logoText}
        alt="Neurosentia"
        sx={{ height: wordmarkHeight, width: 'auto', display: 'block', mixBlendMode: 'lighten' }}
      />
    </Box>
  );
}

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
            <Box className='app-content-home-left-banner-small' sx={{ pr: 3 }}>
              <HomeBrandRow iconWidth="72px" wordmarkHeight="28px" marginLeft={-0.25} />
              <Typography sx={{ pt: 3, color: '#d2d2d2', fontSize: '1.5em' }}>
                A space where algorithms think, stories breathe, and art inspires.
              </Typography>
              <Typography sx={{ color: '#d2d2d2', fontSize: '1.5em' }}>
                Building softwares at the intersection of AI, code, art, and ideas.
              </Typography>
              <HomeDeepThoughtSection />
            </Box>

            <Box className='app-content-home-left-banner' sx={{ pr: '45px' }}>
              <HomeBrandRow iconWidth="96px" wordmarkHeight="36px" marginLeft={-0.75} />
              <Typography sx={{ pt: 4, color: '#d2d2d2', fontSize: '1.5em' }}>
                A space where algorithms think, stories breathe, and art inspires.
              </Typography>
              <Typography sx={{ color: '#d2d2d2', fontSize: '1.5em' }}>
                Building softwares at the intersection of AI, code, art, and ideas.
              </Typography>
              <HomeDeepThoughtSection />
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