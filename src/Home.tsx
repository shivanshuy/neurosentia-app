import { Box, Typography } from '@mui/material';
import BlogHighlights from './components/BlogHighlights';
import HomeFooter from './components/HomeFooter';
import ProofShowcase from './components/ProofShowcase';
import SectionHeading from './components/SectionHeading';
import ServicesOfferings from './components/ServicesOfferings';
import { useSettings } from './SettingsProvider';
import logoIcon from './assets/logo-icon.png';
import logoText from './assets/logo-text.png';

type HomeBrandRowProps = {
  iconWidth: string;
  wordmarkHeight: string;
  marginLeft: number;
};

function HomeDeepThoughtSection() {
  return (
    <Box
      sx={{
        mt: 4,
        pl: 2.5,
        borderLeft: '2px solid',
        borderColor: 'primary.main',
      }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
        Like Deep Thought, modern AI can compute remarkable answers — but only when the question is clear.
        We help you find the right problem, then build the software and intelligence to solve it.
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ pt: 2.5, color: 'text.primary', fontStyle: 'italic', fontWeight: 500 }}
      >
        In search of The Ultimate Question
      </Typography>
      <Typography variant="body2" sx={{ pt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
        A race of hyper-intelligent, pan-dimensional beings build a supercomputer named Deep Thought to calculate the
        &quot;Answer to the Ultimate Question of Life, the Universe, and Everything.&quot;
      </Typography>
      <Typography variant="body2" sx={{ pt: 1.5, color: 'text.secondary', fontStyle: 'italic' }}>
        After 7.5 million years of processing, the computer reveals the answer is 42.
      </Typography>
      <Typography variant="body2" sx={{ pt: 1.5, color: 'text.secondary', fontStyle: 'italic' }}>
        The beings are completely bewildered by the answer because they do not know what the actual Ultimate Question is.
      </Typography>
      <Typography
        variant="caption"
        sx={{
          pt: 2,
          display: 'block',
          color: 'text.disabled',
          fontFamily: 'var(--ns-font-mono)',
          fontStyle: 'italic',
        }}
      >
        — Douglas Adams
      </Typography>
    </Box>
  );
}

function HomeThemeNote() {
  const { openSettings } = useSettings();

  return (
    <Box className="home-theme-note" sx={{ mt: 3 }}>
      <Typography variant="body2" sx={{ color: 'text.disabled', lineHeight: 1.6 }}>
        This site is a small proof of craft — open{' '}
        <button type="button" className="home-theme-note-link" onClick={openSettings}>
          Settings
        </button>{' '}
        to switch fonts and color themes. We build polished software, not generic templates.
      </Typography>
    </Box>
  );
}

function HomeHeroIntro({ subtitlePt = 3 }: { subtitlePt?: number }) {
  return (
    <>
      <Typography variant="subtitle1" sx={{ pt: subtitlePt, color: 'text.secondary' }}>
        A space where algorithms think, stories breathe, and art inspires.
      </Typography>
      <Typography
        variant="body1"
        className="home-section-intro"
        sx={{ pt: 2, color: 'text.primary', fontWeight: 600, lineHeight: 1.65, width: '100%', maxWidth: 'none' }}
      >
        We build fast websites and embed AI — chatbots, agents, and RAG — for teams who want builders and thinkers,
        not another &quot;transform your business&quot; pitch.
      </Typography>
      <Typography variant="body2" sx={{ pt: 1.5, color: 'text.secondary', lineHeight: 1.65 }}>
        We solve real-world challenges with recent advances in AI: large language models, agentic workflows,
        retrieval-augmented systems, and scalable web applications built for production.
      </Typography>
      <HomeDeepThoughtSection />
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

function HomeSection({
  className,
  id,
  children,
}: {
  className: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Box id={id} className={`app-content-section ${className}`}>
      <Box className="home-section-inner" sx={{ width: '100%', maxWidth: '100%' }}>
        {children}
      </Box>
    </Box>
  );
}

function Home() {
  return (
    <Box className='app-content-page'>
      <Box id="hero" className='app-content-home'>
        <Box className='app-content-home-left'>
          <Box className='app-content-home-left-content'>
            <Box
              sx={{
                backgroundImage: 'url("hero1.jpg")',
                backgroundRepeat: 'no-repeat',
              }}
              className='app-content-home-left-image'
            />
            <Box className='app-content-home-left-banner-small' sx={{ pr: 3 }}>
              <HomeBrandRow iconWidth="72px" wordmarkHeight="28px" marginLeft={-0.75} />
              <HomeHeroIntro />
            </Box>

            <Box className='app-content-home-left-banner' sx={{ pr: '45px' }}>
              <HomeBrandRow iconWidth="96px" wordmarkHeight="36px" marginLeft={-1} />
              <HomeHeroIntro subtitlePt={4} />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            backgroundImage: 'url("hero1.jpg")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
          className='app-content-home-right'
        />
      </Box>

      <HomeSection className="app-content-provide-services" id="services">
        <SectionHeading>Services we provide</SectionHeading>
        <Typography
          variant="body1"
          className="home-section-intro"
          sx={{ mt: 2, color: 'text.secondary', width: '100%', maxWidth: 'none' }}
        >
          A product menu, not a buzzword buffet — each service ships a concrete outcome.
        </Typography>
        <ServicesOfferings />
      </HomeSection>

      <HomeSection className="app-content-proof" id="proof">
        <SectionHeading>What we&apos;ve built</SectionHeading>
        <Typography
          variant="body1"
          className="home-section-intro"
          sx={{ mt: 2, color: 'text.secondary', width: '100%', maxWidth: 'none' }}
        >
          We ship real software. Start with something you can talk to.
        </Typography>
        <ProofShowcase />
        <HomeThemeNote />
      </HomeSection>

      <HomeSection className="app-content-explore" id="explore">
        <SectionHeading>Explore and Learn</SectionHeading>
        <Typography
          variant="body1"
          className="home-section-intro"
          sx={{ mt: 2, color: 'text.secondary', width: '100%', maxWidth: 'none' }}
        >
          Our writing reflects deep interest in AI, code, and ideas — technical curiosity, not generic corporate blog filler.
        </Typography>
        <BlogHighlights />
      </HomeSection>

      <HomeSection className="app-content-about" id="about">
        <SectionHeading>About the company</SectionHeading>
        <Typography
          variant="body1"
          className="home-section-intro"
          sx={{ mt: 2, color: 'text.secondary', width: '100%', maxWidth: 'none' }}
        >
          Neurosentia is a space where algorithms think, stories breathe, and art inspires — a studio of builders and
          thinkers at the crossroads of AI, code, art, and ideas. We care about distinctive design, capable systems,
          and software that feels considered down to the last detail.
        </Typography>
      </HomeSection>

      <Box component="footer" className='app-content-section app-content-contact'>
        <HomeFooter />
      </Box>
    </Box>
  );
}

export default Home;
