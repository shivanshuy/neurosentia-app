import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router";


const blogList = [
    {
        moreLink: '/ai-agents',
        header: 'AI Agents',
        text: 'AI Agents be described as a system that can use a LLM to reason through a problem, create a plan to solve the problem, and execute the plan.'
    },
    {
        moreLink: '/react-agent-langgraph',
        header: 'React Agent with LangGraph',
        text: 'Code Example of a ReAct Agent using LangGraph and Ollama\'s Mistral model.',
    }
]

function BlogHighlight(blogItem: any) {
    let navigate = useNavigate();
    return (
        <React.Fragment>
            <ListItem alignItems="flex-start" onClick={() => navigate(blogItem.moreLink)}>
                <ListItemAvatar sx={{ marginTop: '8px' }}>
                    <Avatar alt="Remy Sharp" src="blog-item2.png" />
                </ListItemAvatar>
                <ListItemText
                    primary={<Typography gutterBottom sx={{ color: '#f9f0ff', fontSize: '1.8em' }} component="div">{blogItem.header}</Typography>}
                    secondary={
                        <React.Fragment>
                            <Typography gutterBottom sx={{ color: '#b1b1b1', fontSize: '1em' }} component="div">{blogItem.text}</Typography>
                        </React.Fragment>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" sx={{ borderColor: '#454041', marginRight: '20px' }} />
        </React.Fragment>
    )
}



export default function AIBlogItems() {

    const blogItems: any[] = []

    blogList.forEach(item => {
        blogItems.push(BlogHighlight(item))
    });

    return (
        <Box className='app-content-page' sx={{ height: '100%', backgroundColor: '#1d1d1d' }}>
            <Typography sx={{ mt: '15px', color: '#f9f0ff', fontSize: '2.5em', fontWeight: 'bold' }}>
                About AI
            </Typography>
            <List sx={{ mt: '20px', width: '100%', bgcolor: '#1d1d1d', color: '#f9f0ff' }}>
                {blogItems}
            </List>
        </Box>
    );
}
