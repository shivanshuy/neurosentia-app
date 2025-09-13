import { useState } from 'react'
import { Box, Typography } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Link } from "react-router";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PageList from '../PageList';

type PageItem = {
  key: string;
  route: string;
  text: string;
};

let pages: PageItem[] = [{ text: "Home", route: "/", key: "HOME" },...PageList];

const StyledToolbar = styled(Toolbar)(({ }) => ({
  alignItems: 'flex-start',
  paddingTop: 0,
  paddingBottom: 0,
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    minHeight: '50px',
  },
}));

const AppBarComponent = () => {

  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 320, backgroundColor: '#f37b83', color: '#f9f0ff', height: '100vh' }} role="presentation" onClick={toggleDrawer(false)}>
      <Box sx={{ml: '20px', color: '#f37b83' }}>
        <IconButton sx={{ mt: '8px'}} onClick={toggleDrawer(false)}>
          <CloseRoundedIcon style={{ color: '#f9f0ff' }} />
        </IconButton>
      </Box>
      <Box sx={{ml: 5, color: '#f9f0ff' }}>
        <List>
          {pages.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.route}>
                <ListItemText>
                  <Typography sx={{ color: '#f9f0ff', fontSize: '1.5em', fontWeight: 'bold' }}>{item.text}</Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <div className="app-bar-top">
      <AppBar position="static" sx={{ bgcolor: "#1d1d1d" }}>
        <StyledToolbar>
          <IconButton sx={{ mt: '8px'}} onClick={toggleDrawer(true)}>
            <MenuRoundedIcon style={{ color: '#f9f0ff' }} />
          </IconButton>
        </StyledToolbar>
      </AppBar>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
};

export default AppBarComponent;