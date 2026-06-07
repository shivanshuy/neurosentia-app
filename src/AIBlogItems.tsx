import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SectionHeading from './components/SectionHeading';
import TopicIcon from './components/TopicIcon';

type BlogItem = {
  moreLink: string;
  header: string;
  text: string;
  icon: React.ReactNode;
};

const blogList: BlogItem[] = [
  {
    moreLink: '/ai-agents',
    header: 'AI Agents',
    text: 'AI Agents can be described as a system that uses an LLM to reason through a problem, create a plan, and execute it.',
    icon: <MenuBookOutlinedIcon />,
  },
  {
    moreLink: '/react-agent-langgraph',
    header: 'React Agent with LangGraph',
    text: "Code example of a ReAct Agent using LangGraph and Ollama's Mistral model.",
    icon: <ArticleOutlinedIcon />,
  },
];

function BlogHighlight({ header, text, moreLink, icon }: BlogItem) {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <ListItem
        alignItems="flex-start"
        onClick={() => navigate(moreLink)}
        sx={{
          py: 2,
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          '&:hover': { backgroundColor: 'var(--ns-hover-bg)' },
        }}
      >
        <ListItemAvatar sx={{ mt: 0.5, minWidth: 58 }}>
          <TopicIcon>{icon}</TopicIcon>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="h4" color="text.primary">
              {header}
            </Typography>
          }
          secondary={
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.disabled' }}>
              {text}
            </Typography>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" sx={{ borderColor: 'divider', mr: 2.5 }} />
    </React.Fragment>
  );
}

export default function AIBlogItems() {
  return (
    <Box className="app-content-page" sx={{ height: '100%', backgroundColor: 'background.default' }}>
      <Box className="home-section-inner" sx={{ px: { xs: 0, md: 0 } }}>
        <SectionHeading>About AI</SectionHeading>
        <List sx={{ mt: 2, width: '100%', bgcolor: 'transparent', color: 'text.primary', p: 0 }}>
          {blogList.map((item) => (
            <BlogHighlight key={item.header} {...item} />
          ))}
        </List>
      </Box>
    </Box>
  );
}
