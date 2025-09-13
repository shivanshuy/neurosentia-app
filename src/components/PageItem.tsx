import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CodeBlockItem from './CodeBlockItem';
import { Image } from 'mui-image';


interface PageItemContent {
    type: string;
    text?: string;
    code?: string;
    src?: string;
    href?: string;
}

interface PageItemProp {
    header: string;
    text: string;
    contents?: Array<PageItemContent | undefined>;
}

export default function PageItem(item: PageItemProp) {
    let contentItems = []
    if (item.header) {
        contentItems.push(
            <Typography gutterBottom align="center" sx={{ mb: 3, fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#353E47', marginTop: '16px' }}>{item.header}</Typography>
        )
    }
    if (item.text) {
        contentItems.push(
            <Box sx={{ fontSize: '15px', fontWeight: 400, color: '#353E47', fontFamily: 'monospace' }} >
                {item.text}
            </Box>
        )
    }

    if (item.contents) {
        item.contents.forEach(element => {
            if(!element) return; // Skip undefined elements
            if (element.type === 'header') {
                contentItems.push(
                    <Typography gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#353E47', marginTop: '10px' }}>{element.text}</Typography>
                )
            } else if (element.type === 'subHeader') {
                contentItems.push(
                    <Typography gutterBottom sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#353E47', marginTop: '10px' }}>{element.text}</Typography>
                )
            } else if (element.type === 'text') {
                contentItems.push(
                    <Box sx={{ fontSize: '15px', fontWeight: 400, color: '#353E47', fontFamily: 'monospace' }} >
                        {element.text}
                    </Box>
                )
            } else if (element.type === 'code' && element.code) {
                contentItems.push(
                    <CodeBlockItem codeText={element.code} />
                )
            } else if (element.type === 'image' && element.src) {
                contentItems.push(
                    <Box sx={{ fontSize: '15px', fontWeight: 400, color: '#353E47', fontFamily: 'monospace', }} >
                        <Image src={element.src} width='70%' />
                    </Box>
                )
            } else if (element.type === 'link') {
                contentItems.push(
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: '10px',
                            fontSize: '15px',
                            fontWeight: 400,
                            color: '#353E47',
                            fontFamily: 'monospace',
                        }}>
                        <Typography variant="h6" gutterBottom sx={{
                            fontFamily: 'monospace', color: '#353E47', paddingTop: '2px'
                        }}>Go to - </Typography>
                        <Link href={element.href} sx={{ textDecorationLine: 'none', fontFamily: 'monospace', marginLeft: '5px' }} variant="body2">
                            {element.text}
                        </Link>
                    </Box>
                )
            } else if (element.type === 'reference') {
                contentItems.push(
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: '10px',
                            fontSize: '15px',
                            fontWeight: 400,
                            color: '#353E47',
                            fontFamily: 'monospace',
                        }}>
                        <Typography variant="h6" gutterBottom sx={{
                            fontFamily: 'monospace', color: '#353E47', paddingTop: '2px'
                        }}>External Reference - </Typography>
                        <Link href={element.href} sx={{ textDecorationLine: 'none', fontFamily: 'monospace', marginLeft: '5px' }} variant="body2">
                            {element.text}
                        </Link>
                    </Box>
                )
            }
        }
    
    )
    }

    return (
        <Box className='app-content-page' sx={{ height: '100%', backgroundColor: '#ffffff' }}>
            {contentItems}
        </Box>
    );

}
