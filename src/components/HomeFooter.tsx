import type { MouseEvent } from 'react';
import { Box } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router';
import { FaInstagram, FaTwitter, FaDribbble } from 'react-icons/fa';

const CONTACT_EMAIL = 'ueurosent@gmail.com';

const footerNavLinks = [
  { label: 'Services', to: '/#services' },
  { label: "What we've built", to: '/#proof' },
  { label: 'Explore', to: '/#explore' },
  { label: 'About AI', to: '/ai-blog-items' },
  { label: 'About', to: '/#about' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: FaInstagram },
  { label: 'Twitter', href: 'https://twitter.com', icon: FaTwitter },
  { label: 'Dribbble', href: 'https://dribbble.com', icon: FaDribbble },
];

function scrollToTarget(targetId: string | null) {
  const scrollContainer = document.querySelector('.app-content-page');

  if (targetId) {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }

  if (scrollContainer instanceof HTMLElement) {
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function FooterNavLink({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const [path, hash] = to.split('#');
    const targetPath = path || '/';
    const targetId = hash || null;

    if (location.pathname === targetPath) {
      event.preventDefault();
      scrollToTarget(targetId);
      return;
    }

    if (targetId) {
      event.preventDefault();
      navigate(`${targetPath}#${targetId}`);
      window.setTimeout(() => scrollToTarget(targetId), 150);
    }
  };

  return (
    <RouterLink to={to} className="home-footer-nav-link" onClick={handleClick}>
      {label}
    </RouterLink>
  );
}

function HomeFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToHero = (event: MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      event.preventDefault();
      scrollToTarget('hero');
      return;
    }

    event.preventDefault();
    navigate('/');
    window.setTimeout(() => scrollToTarget('hero'), 150);
  };

  return (
    <Box className="home-footer">
      <Box className="home-footer-wave-wrap">
        <Box
          component="svg"
          className="home-footer-wave"
          viewBox="0 0 1440 960"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,960 L1440,960 L1440,275 C1140,255 850,505 580,528 C380,548 160,455 0,370 Z"
            fill="var(--ns-footer)"
          />
        </Box>

        <Box className="home-footer-content">
          <Box className="home-footer-brand">
            <RouterLink
              to="/"
              className="home-footer-logo"
              aria-label="Neurosentia home"
              onClick={goToHero}
            >
              NEUROSENTIA
            </RouterLink>
            <RouterLink to="/chatterbug" className="home-footer-contact-button">
              Contact Us
            </RouterLink>
            <a className="home-footer-email" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </Box>

          <Box className="home-footer-right">
            <nav className="home-footer-nav" aria-label="Footer">
              {footerNavLinks.map((item) => (
                <FooterNavLink key={item.label} to={item.to} label={item.label} />
              ))}
            </nav>

            <Box className="home-footer-social" aria-label="Social links">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-footer-social-link"
                    aria-label={item.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default HomeFooter;
