import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import { timelineItemClasses } from '@mui/lab/TimelineItem';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { LuSend } from 'react-icons/lu';
import { getAIMessage } from './ApiImpl';

export default function ChatBot() {
    const [userMessage, setUserMessage] = React.useState("");
    const [prevUserMessage, setPrevUserMessage] = React.useState("");
    const [prevAIMessage, setPrevAIMessage] = React.useState("");
    const [sessionId, setSessionId] = React.useState(null);


    const handleSend = () => {
        console.log(userMessage);

        getAIMessage(userMessage, sessionId).
            then(function (response) {
                console.log(response);
                setSessionId(response.data.sessionId);
                setPrevAIMessage(response.data.message.content);
                setPrevUserMessage(userMessage)
                setUserMessage("")
            })
            .catch(function (error) {
                console.log(error);
            });
    };


    return (
        <Box className='app-content-page' sx={{ height: '100%', backgroundColor: '#ffffff', color: '#353E47' }}>
            <Box className='chat-bot-content'>
                <Box className='chat-bot-content-main'>
                    <Box className='chat-bot-pre-messsage-header'>
                        <Typography sx={{ mt: '2px', color: '#1d1d1d', fontSize: '2.5em', fontWeight: 'bold' }}>
                            Chatterbug
                        </Typography>
                    </Box>
                    <Box className='chat-bot-pre-messsage'>
                        <Timeline sx={{
                            width: '97%',
                            padding: '6px',
                            [`& .${timelineItemClasses.root}:before`]: {
                                flex: 0,
                                padding: 0,
                                marginLeft: '-20px'
                            },
                        }}>
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineConnector sx={{ bgcolor: '#1d1d1d' }} />
                                    <TimelineDot color="inherit">
                                        <PermIdentityOutlinedIcon />
                                    </TimelineDot>
                                    <TimelineConnector sx={{ bgcolor: '#1d1d1d' }} />
                                </TimelineSeparator>
                                <TimelineContent sx={{ py: '12px', px: 2 }}>
                                    <TextField
                                        disabled
                                        sx={{backgroundColor: '#1d1d1d', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', borderRadius: 1 }}
                                        fullWidth
                                        id="outlined-multiline-flexible"
                                        multiline
                                        rows={2}
                                        value={prevUserMessage}
                                    />
                                </TimelineContent>
                            </TimelineItem>
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineConnector sx={{ bgcolor: '#1d1d1d' }} />
                                    <TimelineDot color="inherit">
                                        <SmartToyOutlinedIcon />
                                    </TimelineDot>
                                    <TimelineConnector sx={{ bgcolor: '#1d1d1d' }} />
                                </TimelineSeparator>
                                <TimelineContent sx={{ py: '12px', px: 2 }}>
                                    <Box className='chat-bot-pre-ai-messsage-small'>
                                        <TextField
                                            disabled
                                            sx={{backgroundColor: '#1d1d1d', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', borderRadius: 1 }}
                                            fullWidth
                                            id="outlined-multiline-flexible"
                                            multiline
                                            rows={11}
                                            value={prevAIMessage}
                                        />
                                    </Box>
                                    <Box className='chat-bot-pre-ai-messsage-big'>
                                        <TextField
                                            disabled
                                            sx={{backgroundColor: '#1d1d1d', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', borderRadius: 1 }}
                                            fullWidth
                                            id="outlined-multiline-flexible"
                                            multiline
                                            rows={17}
                                            value={prevAIMessage}
                                        />
                                    </Box>
                                </TimelineContent>
                            </TimelineItem>
                        </Timeline>
                    </Box>
                    <Paper
                        className='chat-bot-user-messsage'
                        component="form"
                        sx={{ display: 'flex', alignItems: 'center', width: '96%' }}
                    >
                        <InputBase
                            sx={{ color: '#1d1d1d', ml: 1, flex: 1 }}
                            placeholder="type here"
                            inputProps={{ 'aria-label': 'type here' }}
                            value={userMessage}
                            onChange={e => setUserMessage(e.target.value)}
                        />
                        <Divider sx={{ height: 50, m: 0.5 }} orientation="vertical" />
                        <IconButton color="primary" sx={{ p: '5px' }} aria-label="directions" onClick={handleSend}>
                            <LuSend color='#1d1d1d' />
                        </IconButton>
                    </Paper>
                </Box>
                <Box className='chat-bot-content-history'>
                    "Shivanshu"
                </Box>
            </Box>
        </Box>
    );
}