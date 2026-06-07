import * as React from 'react';
import type { ReactNode } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import TopicIcon from './TopicIcon';

type BlogItem = {
  moreLink: string;
  header: string;
  text: string;
  icon: ReactNode;
};

const blogList: BlogItem[] = [
  {
    moreLink: '/ai-blog-items',
    header: 'PEFT using Unsloth',
    text: 'Unsloth is an open-source Python framework that speeds up the fine-tuning of large language models (LLMs).',
    icon: <MenuBookOutlinedIcon />,
  },
  {
    moreLink: '/ai-blog-items',
    header: 'LLM from Scratch',
    text: 'Creating a language model from scratch involves several key steps, including data collection, preprocessing, and training.',
    icon: <ArticleOutlinedIcon />,
  },
  {
    moreLink: '/ai-agents',
    header: 'AI Agents',
    text: 'AI Agents can be described as a system that uses an LLM to reason through a problem, create a plan, and execute it with tools.',
    icon: <AutoStoriesOutlinedIcon />,
  },
];

function BlogHighlight({ header, text, moreLink, icon }: BlogItem) {
  return (
    <React.Fragment>
      <ListItem
        alignItems="flex-start"
        sx={{
          py: 2,
          transition: 'background-color 0.2s ease',
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'var(--ns-hover-bg)',
          },
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
            <React.Fragment>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.disabled' }}>
                {text}
              </Typography>
              <Link
                component={RouterLink}
                to={moreLink}
                variant="overline"
                sx={{
                  display: 'inline-block',
                  mt: 1.5,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                Learn More
              </Link>
            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" sx={{ borderColor: 'divider', mr: 2.5 }} />
    </React.Fragment>
  );
}

export default function BlogHighlights() {
  return (
    <List sx={{ mt: 2, width: '100%', bgcolor: 'transparent', color: 'text.primary', p: 0 }}>
      {blogList.map((item) => (
        <BlogHighlight key={item.header} {...item} />
      ))}
    </List>
  );
}
