import { Box, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import { Link } from "react-router";
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
import PageList from '../PageList';

type PageItem = {
  key: string;
  route: string;
  text: string;
};

const SidebarComponent = () => {

  const pages: PageItem[] = PageList;

  return (

    <div className='app-menu'>
      <Box className='app-menu-left'>
        <Box className='app-menu-left-home' sx={{ mt: 2, paddingLeft: '8px', paddingRight: '8px' }}>
          <IconButton component={Link} to={"/"}>
            <CottageOutlinedIcon style={{ color: '#f9f0ff' }} />
          </IconButton>
        </Box>
        {pages.map((item) => (
          <Box key={item.key} sx={{ paddingLeft: '8px', paddingRight: '8px' }}>
            
              {item.key === "CHATBOT" && <IconButton sx={{marginTop: '15px'}} component={Link} to={item.route}><SmartToyOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
              {item.key === "AI" && <IconButton sx={{marginTop: '14px'}} component={Link} to={item.route}><PsychologyOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
              {item.key === "PROGRAMMING" && <IconButton sx={{marginTop: '13px'}} component={Link} to={item.route}><TerminalOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
              {item.key === "MATHS" && <IconButton sx={{marginTop: '12px'}} component={Link} to={item.route}><FunctionsOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
              {item.key === "PHILOSOPHY" && <IconButton sx={{marginTop: '12px'}} component={Link} to={item.route}><PersonSearchOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
              {item.key === "BOOKS" && <IconButton sx={{marginTop: '16px'}} component={Link} to={item.route}><AutoStoriesOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
              {item.key === "HISTORY" && <IconButton sx={{marginTop: '13px'}} component={Link} to={item.route}><TravelExploreOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
              {item.key === "BLOG" && <IconButton sx={{marginTop: '14px'}} component={Link} to={item.route}><BookOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
              {item.key === "CONTACT" && <IconButton sx={{marginTop: '14px'}} component={Link} to={item.route}><PermContactCalendarOutlinedIcon style={{ color: '#f9f0ff' }} /></IconButton>}
          
          </Box>
        ))}
      </Box>

      <Box className='app-menu-right'>
        <Box sx={{ mt: 1.25, color: '#f9f0ff', height: 40, display: 'flex', alignItems: 'flex-end' }}>
          <ListItem disablePadding sx={{ width: '100%' }}>
            <ListItemButton component={Link} to="/" sx={{ py: 0, minHeight: 'unset', alignItems: 'flex-end' }}>
              <ListItemText sx={{ my: 0 }}>
                <Typography sx={{ color: '#f9f0ff', fontSize: '1.5em', fontWeight: 'bold', lineHeight: 1 }}>
                  Back to Home
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>
        </Box>
        <Box sx={{ mt: 1, color: '#f9f0ff' }}>
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
    </div>
  );
};

export default SidebarComponent;