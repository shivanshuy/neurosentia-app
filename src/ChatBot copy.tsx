import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function ChatBot() {
    return (
        <Box className='app-content-page' sx={{ height: '100%', backgroundColor: '#ffffff', color: '#353E47' }}>
            <Box className='chat-bot-content'>
                <Box className='chat-bot-content-main'>
                    <Box className='chat-bot-pre-messsage'>
                        <Box className='chat-bot-pre-user-messsage'>
                            <TextField
                                disabled
                                sx={{ backgroundColor: '#f0f2f6' }}
                                fullWidth
                                id="outlined-multiline-flexible"
                                multiline
                                rows={2}
                            />
                        </Box>

                        <Box className='chat-bot-pre-ai-messsage-big'>
                            <TextField
                                disabled
                                sx={{ backgroundColor: '#f0f2f6' }}
                                fullWidth
                                id="outlined-multiline-flexible"
                                multiline
                                rows={20}
                            />
                        </Box>

                        <Box className='chat-bot-pre-ai-messsage-small'>
                            <TextField
                                disabled
                                sx={{ backgroundColor: '#f0f2f6' }}
                                fullWidth
                                id="outlined-multiline-flexible"
                                multiline
                                rows={15}
                            />
                        </Box>
                    </Box>
                    <Box className='chat-bot-user-messsage'>
                        <TextField
                            fullWidth
                            id="outlined-multiline-flexible"
                            multiline
                            rows={2}
                        />
                    </Box>
                </Box>
                <Box className='chat-bot-content-history'>
                    "Shivanshu"
                </Box>
            </Box>
        </Box>
    );
}