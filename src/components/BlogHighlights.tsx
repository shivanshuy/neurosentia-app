import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';


const blogList = [
    {
        moreLink: '/',
        header: 'PEFT using Unsloth',
        text: 'Unsloth is an open-source Python framework that speeds up the fine-tuning of large language models (LLMs).'
    },
    {
        moreLink: '/',
        header: 'LLM from Scratch',
        text: 'Creating a language model from scratch involves several key steps, including data collection, preprocessing, and training.',
    },
    {
        moreLink: '/',
        header: 'AI Agents',
        text: 'AI Agents be described as a system that can use a LLM to reason through a problem, create a plan to solve the problem, and execute the plan with the help of a provided set of tools.',
    }
]

function BlogHighlight(blogItem: any) {
    return (
        <React.Fragment>
            <ListItem alignItems="flex-start">
                <ListItemAvatar sx={{ marginTop: '10px' }}>
                    <Avatar alt="Remy Sharp" src="blog-item2.png" />
                </ListItemAvatar>
                <ListItemText
                    primary={<Typography gutterBottom sx={{ color: '#f9f0ff', fontSize: '1.8em' }} component="div">{blogItem.header}</Typography>}
                    secondary={
                        <React.Fragment>
                            <Typography gutterBottom sx={{ color: '#b1b1b1', fontSize: '1em' }} component="div">{blogItem.text}</Typography>
                            <Link href={blogItem.moreLink} sx={{ textDecorationLine: 'none', fontFamily: 'monospace' }} variant="body2">
                                {"Learn More"}
                            </Link>
                        </React.Fragment>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" sx={{ borderColor: '#454041', marginRight: '20px' }} />
        </React.Fragment>
    )
}



export default function BlogHighlights() {

    const blogItems: any[] = []

    blogList.forEach(item => {
        blogItems.push(BlogHighlight(item))
    });

    return (
        <List sx={{ mt: '20px', width: '100%', bgcolor: '#1d1d1d', color: '#f9f0ff' }}>
            {blogItems}
        </List>
    );
}
