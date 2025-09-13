import Box from '@mui/material/Box';
import { CopyBlock, dracula} from "react-code-blocks";

type CodeBlockItemProps = {
  codeText: string;
};

export default function CodeBlockItem({ codeText }: CodeBlockItemProps) {
    return (
        <Box sx={{ fontSize: '14px', fontWeight: 400, color: '#353E47', fontFamily: 'monospace', margin: '10px' }} >
            <CopyBlock
                language="javascript"
                text={codeText}
                codeBlock
                theme={dracula}
                showLineNumbers={false}
            />
        </Box>
    );
}
