import axios from 'axios';



const getAIMessage = async (message:string, sessionId:string | null) => {
    let payload;

    if (sessionId){
        payload = { 
            sessionId: sessionId,
            message: {content: message}
        }
    } else {
        payload = { 
            message: {content: message}
        }
    }

    const headers = {
        'Content-Type': 'application/json'
    }

    const aiMessage = await axios.post('https://neurosentia.com/__apigw__/api/v1/chat', payload, 
    {
        headers: headers
    })

    return aiMessage;
}

export { getAIMessage };