import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';

type DiagramBlockProps = {
  source: string;
};

function isMermaidErrorSvg(svg: string): boolean {
  return /Syntax error/i.test(svg) || /aria-roledescription=["']error["']/i.test(svg);
}

export default function DiagramBlock({ source }: DiagramBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, '');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const trimmed = source.trim();

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'strict',
          fontFamily: 'var(--ns-font-mono)',
        });

        const { svg } = await mermaid.render(`mermaid-${reactId}`, trimmed);
        if (cancelled) return;

        // Mermaid often returns an error graphic instead of throwing.
        if (isMermaidErrorSvg(svg)) {
          setError('Could not render diagram.');
          return;
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not render diagram.');
        }
      }
    };

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [reactId, trimmed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Box className="canvas-article-diagram">
      <Box className="canvas-article-diagram__toolbar">
        <Button
          type="button"
          size="small"
          variant="text"
          className="canvas-article-diagram__copy"
          startIcon={copied ? <CheckIcon fontSize="inherit" /> : <ContentCopyIcon fontSize="inherit" />}
          onClick={() => void handleCopy()}
          aria-label="Copy Mermaid diagram"
        >
          {copied ? 'Copied' : 'Copy Mermaid'}
        </Button>
      </Box>
      {error ? (
        <Box component="pre" className="canvas-article-diagram__source">
          {trimmed}
        </Box>
      ) : (
        <Box ref={containerRef} className="canvas-article-diagram__svg" />
      )}
    </Box>
  );
}
