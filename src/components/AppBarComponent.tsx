import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Link, useLocation } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PageList from '../PageList';
import { useSettings } from '../SettingsProvider';
type PageItem = {
  key: string;
  route: string;
  text: string;
};

const pages: PageItem[] = [{ text: 'Home', route: '/', key: 'HOME' }, ...PageList];

const StyledToolbar = styled(Toolbar)(() => ({
  alignItems: 'center',
  paddingTop: 0,
  paddingBottom: 0,
  '@media all': {
    minHeight: '56px',
  },
}));

const AppBarComponent = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { openSettings } = useSettings();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleOpenSettings = () => {
    setOpen(false);
    openSettings();
  };

  const isActive = (route: string) => {
    if (route === '/') return location.pathname === '/';
    return location.pathname === route || location.pathname.startsWith(`${route}/`);
  };

  const DrawerList = (
    <Box
      sx={{
        width: 320,
        backgroundColor: 'background.default',
        color: 'text.primary',
        height: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
      role="presentation"
    >
      <Box sx={{ ml: '20px' }}>
        <IconButton sx={{ mt: '8px' }} onClick={toggleDrawer(false)} aria-label="Close menu">
          <CloseRoundedIcon sx={{ color: 'text.primary' }} />
        </IconButton>
      </Box>
      <Box sx={{ ml: 3, mr: 2, flex: 1, overflowY: 'auto' }} onClick={toggleDrawer(false)}>
        <Typography variant="overline" sx={{ mt: 1, mb: 2, display: 'block', color: 'primary.main' }}>
          Neurosentia
        </Typography>
        <List>
          {pages.map((item) => {
            const active = isActive(item.route);
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.route}
                  sx={{
                    borderLeft: '3px solid',
                    borderColor: active ? 'primary.main' : 'transparent',
                    pl: 1.5,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: 'var(--ns-hover-bg)',
                    },
                  }}
                >
                  <ListItemText>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: active ? 700 : 500,
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
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mx: 2, mb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleOpenSettings} sx={{ pl: 1.5, py: 1.25 }}>
            <ListItemText>
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Settings
              </Typography>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <div className="app-bar-top">
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
        <StyledToolbar>
          <IconButton onClick={toggleDrawer(true)} aria-label="Open menu">
            <MenuRoundedIcon sx={{ color: 'primary.main' }} />
          </IconButton>
        </StyledToolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            backgroundImage: 'none',
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
};

export default AppBarComponent;
