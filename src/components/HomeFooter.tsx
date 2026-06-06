import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { FaInstagram, FaTwitter, FaDribbble } from 'react-icons/fa';

const CONTACT_EMAIL = 'grafikaly@example.com';

const footerNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/blog' },
  { label: 'About AI', to: '/ai-blog-items' },
  { label: 'About', to: '/#about' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: FaInstagram },
  { label: 'Twitter', href: 'https://twitter.com', icon: FaTwitter },
  { label: 'Dribbble', href: 'https://dribbble.com', icon: FaDribbble },
];

function HomeFooter() {
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
            fill="#FEE050"
          />
        </Box>

        <Box className="home-footer-content">
          <Box className="home-footer-brand">
            <RouterLink to="/" className="home-footer-logo" aria-label="Neurosentia home">
              NEUROSENTIA
            </RouterLink>
            <a className="home-footer-contact-button" href={`mailto:${CONTACT_EMAIL}`}>
              Contact Us
            </a>
          </Box>

          <Box className="home-footer-right">
            <nav className="home-footer-nav" aria-label="Footer">
              {footerNavLinks.map((item) => (
                <RouterLink key={item.label} to={item.to} className="home-footer-nav-link">
                  {item.label}
                </RouterLink>
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
