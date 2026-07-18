import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import { Link, useLocation } from 'react-router';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import PermContactCalendarOutlinedIcon from '@mui/icons-material/PermContactCalendarOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PageList from '../PageList';
import { useSettings } from '../SettingsProvider';

type PageItem = {
  key: string;
  route: string;
  text: string;
};

const iconByKey: Record<string, ReactNode> = {
  CHATBOT: <SmartToyOutlinedIcon />,
  AI: <PsychologyOutlinedIcon />,
  PROGRAMMING: <TerminalOutlinedIcon />,
  MATHS: <FunctionsOutlinedIcon />,
  PHILOSOPHY: <PersonSearchOutlinedIcon />,
  BOOKS: <AutoStoriesOutlinedIcon />,
  HISTORY: <TravelExploreOutlinedIcon />,
  BLOG: <BookOutlinedIcon />,
  CONTACT: <PermContactCalendarOutlinedIcon />,
};

const NAV_ROW_HEIGHT = 48;
const NAV_TOP_PADDING = 16;

const navRowSx = {
  height: NAV_ROW_HEIGHT,
  minHeight: NAV_ROW_HEIGHT,
  display: 'flex',
  alignItems: 'center',
} as const;

const SidebarComponent = () => {
  const location = useLocation();
  const { openSettings } = useSettings();
  const pages: PageItem[] = PageList;

  const isActive = (route: string) => {
    if (route === '/') return location.pathname === '/';
    return location.pathname === route || location.pathname.startsWith(`${route}/`);
  };

  return (
    <div className='app-menu'>
      <Box className='app-menu-left' sx={{ flexDirection: 'column', height: '100%', pt: `${NAV_TOP_PADDING}px` }}>
        <Box className='app-menu-left-home' sx={{ ...navRowSx, justifyContent: 'center', px: 1 }}>
          <IconButton
            component={Link}
            to="/"
            sx={{
              color: isActive('/') ? 'primary.main' : 'text.primary',
              bgcolor: isActive('/') ? 'var(--ns-accent-muted)' : 'transparent',
            }}
          >
            <CottageOutlinedIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {pages.map((item) => {
            const active = isActive(item.route);
            return (
              <Box key={item.key} sx={{ ...navRowSx, justifyContent: 'center', px: 1, flexShrink: 0 }}>
                <IconButton
                  component={Link}
                  to={item.route}
                  aria-label={item.text}
                  sx={{
                    color: active ? 'primary.main' : 'text.primary',
                    bgcolor: active ? 'var(--ns-accent-muted)' : 'transparent',
                  }}
                >
                  {iconByKey[item.key]}
                </IconButton>
              </Box>
            );
          })}
        </Box>
        <Box className="app-menu-settings" sx={{ borderTop: '1px solid', borderColor: 'divider', flexShrink: 0, pb: 2 }}>
          <Box sx={{ ...navRowSx, justifyContent: 'center', px: 1 }}>
            <IconButton
              onClick={openSettings}
              aria-label="Settings"
              sx={{ color: 'text.primary' }}
            >
              <SettingsOutlinedIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box className='app-menu-right' sx={{ flexDirection: 'column', height: '100%', pt: `${NAV_TOP_PADDING}px` }}>
        <Box sx={{ ...navRowSx, color: 'text.primary', flexShrink: 0 }}>
          <ListItem disablePadding sx={{ width: '100%', height: '100%' }}>
            <ListItemButton
              component={Link}
              to="/"
              sx={{
                ...navRowSx,
                width: '100%',
                py: 0,
                borderLeft: '3px solid',
                borderColor: isActive('/') ? 'primary.main' : 'transparent',
                pl: 1.5,
              }}
            >
              <ListItemText sx={{ my: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Back to Home
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>
        </Box>
        <Box sx={{ color: 'text.primary', flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <List disablePadding sx={{ py: 0 }}>
            {pages.map((item) => {
              const active = isActive(item.route);
              return (
                <ListItem key={item.text} disablePadding sx={{ ...navRowSx, flexShrink: 0 }}>
                  <ListItemButton
                    component={Link}
                    to={item.route}
                    sx={{
                      ...navRowSx,
                      width: '100%',
                      py: 0,
                      borderLeft: '3px solid',
                      borderColor: active ? 'primary.main' : 'transparent',
                      pl: 1.5,
                      '&:hover': {
                        backgroundColor: 'var(--ns-hover-bg)',
                      },
                    }}
                  >
                    <ListItemText sx={{ my: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: active ? 700 : 500,
                          lineHeight: 1.2,
                          color: active ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {item.text}
                      </Typography>
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
        <Box className="app-menu-settings" sx={{ borderTop: '1px solid', borderColor: 'divider', flexShrink: 0, pb: 2 }}>
          <ListItem disablePadding sx={{ ...navRowSx }}>
            <ListItemButton
              onClick={openSettings}
              sx={{
                ...navRowSx,
                width: '100%',
                py: 0,
                pl: 1.5,
                '&:hover': {
                  backgroundColor: 'var(--ns-hover-bg)',
                },
              }}
            >
              <ListItemText sx={{ my: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.2, color: 'text.primary' }}>
                  Settings
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>
        </Box>
      </Box>
    </div>
  );
};

export default SidebarComponent;
