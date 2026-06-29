import * as React from 'react';
import Box from '@mui/material/Box';
import mermaid from 'mermaid';

let mermaidReady = false;

function ensureMermaidTheme() {
  if (mermaidReady) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: {
      background: '#f2f0eb',
      primaryColor: '#eef5f1',
      primaryTextColor: '#1c211e',
      primaryBorderColor: '#3d6b52',
      lineColor: '#3d6b52',
      secondaryColor: '#f4f6f2',
      tertiaryColor: '#faf9f6',
      fontFamily: 'var(--crt-display, monospace)',
      fontSize: '12px',
    },
    flowchart: {
      curve: 'linear',
      padding: 12,
    },
  });
  mermaidReady = true;
}

type MermaidDiagramProps = {
  chart: string;
  diagramId: string;
};

export default function MermaidDiagram({ chart, diagramId }: MermaidDiagramProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !chart.trim()) return;

    ensureMermaidTheme();
    const renderId = `mermaid-${diagramId}-${Math.random().toString(36).slice(2, 8)}`;
    let cancelled = false;

    const render = async () => {
      try {
        setError(null);
        const { svg } = await mermaid.render(renderId, chart.trim());
        if (!cancelled && container) {
          container.innerHTML = svg;
        }
      } catch {
        if (!cancelled) {
          setError('Could not render diagram — source may be invalid.');
          container.textContent = '';
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId]);

  if (error) {
    return (
      <Box className="crt-mermaid-wrap">
        <p className="crt-mermaid-error">{error}</p>
        <pre className="crt-mermaid-source">{chart}</pre>
      </Box>
    );
  }

  return <Box className="crt-mermaid-wrap" ref={containerRef} />;
}
