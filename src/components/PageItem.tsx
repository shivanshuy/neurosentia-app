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
            <Typography variant="h2" gutterBottom align="center" sx={{ mb: 3, mt: 2, fontFamily: 'var(--ns-font-mono)', color: '#353E47', textTransform: 'none', letterSpacing: '0.02em' }}>{item.header}</Typography>
        )
    }
    if (item.text) {
        contentItems.push(
            <Typography variant="body2" sx={{ color: '#353E47', fontFamily: 'var(--ns-font-mono)' }}>
                {item.text}
            </Typography>
        )
    }

    if (item.contents) {
        item.contents.forEach(element => {
            if(!element) return; // Skip undefined elements
            if (element.type === 'header') {
                contentItems.push(
                    <Typography variant="h3" gutterBottom sx={{ color: '#353E47', mt: 1.25 }}>{element.text}</Typography>
                )
            } else if (element.type === 'subHeader') {
                contentItems.push(
                    <Typography variant="h4" gutterBottom sx={{ color: '#353E47', mt: 1.25 }}>{element.text}</Typography>
                )
            } else if (element.type === 'text') {
                contentItems.push(
                    <Typography variant="body2" sx={{ color: '#353E47', fontFamily: 'var(--ns-font-mono)' }}>
                        {element.text}
                    </Typography>
                )
            } else if (element.type === 'code' && element.code) {
                contentItems.push(
                    <CodeBlockItem codeText={element.code} />
                )
            } else if (element.type === 'image' && element.src) {
                contentItems.push(
                    <Box sx={{ color: '#353E47', fontFamily: 'var(--ns-font-mono)' }}>
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
                            color: '#353E47',
                            fontFamily: 'var(--ns-font-mono)',
                        }}>
                        <Typography variant="overline" gutterBottom sx={{ color: '#353E47', pt: 0.25 }}>Go to — </Typography>
                        <Link href={element.href} sx={{ textDecorationLine: 'none', fontFamily: 'var(--ns-font-mono)', marginLeft: '5px' }} variant="body2">
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
                            color: '#353E47',
                            fontFamily: 'var(--ns-font-mono)',
                        }}>
                        <Typography variant="overline" gutterBottom sx={{ color: '#353E47', pt: 0.25 }}>External Reference — </Typography>
                        <Link href={element.href} sx={{ textDecorationLine: 'none', fontFamily: 'var(--ns-font-mono)', marginLeft: '5px' }} variant="body2">
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
