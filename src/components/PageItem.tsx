import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CodeBlockItem from './CodeBlockItem';
import DiagramBlock from './DiagramBlock';
import LayerWeightViz from './LayerWeightViz';
import GpuMatmulParallelViz from './GpuMatmulParallelViz';
import QuantBitWidthViz from './QuantBitWidthViz';
import QuantGranularityViz from './QuantGranularityViz';
import QuantStoryPathViz from './QuantStoryPathViz';
import DatasetGoalMapViz from './DatasetGoalMapViz';
import DatasetFormatViz from './DatasetFormatViz';
import DatasetKindCompareViz from './DatasetKindCompareViz';
import DatasetModelTemplateViz from './DatasetModelTemplateViz';
import LlamaCppNeedViz from './LlamaCppNeedViz';
import LlamaCppArchViz from './LlamaCppArchViz';
import LlamaCppCompareViz from './LlamaCppCompareViz';
import { Image } from 'mui-image';
import { Link as RouterLink, useNavigate } from 'react-router';

interface PageItemContent {
  type: string;
  text?: string;
  code?: string;
  src?: string;
  href?: string;
  /** Runtime-matched id; kept as string so content modules don't widen-fail under tsc. */
  viz?: string;
}

export interface PageItemProp {
  header: string;
  text: string;
  contents?: Array<PageItemContent | undefined>;
}

function estimateReadTime(item: PageItemProp): string {
  const body = [
    item.text,
    ...(item.contents ?? []).map((part) => part?.text ?? part?.code ?? ''),
  ].join(' ');
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(4, Math.round(words / 180))} min read`;
}

function renderRichText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function PageItem(item: PageItemProp) {
  const navigate = useNavigate();
  const contents = item.contents?.filter((element): element is PageItemContent => Boolean(element)) ?? [];
  const sections = contents
    .filter((element) => element.type === 'header' && element.text)
    .map((element, index) => ({
      label: element.text as string,
      id: `section-${index + 1}`,
    }));

  let headerIndex = 0;
  const contentItems = contents.map((element, index) => {
    const key = `${element.type}-${index}`;
    if (element.type === 'header') {
      const section = sections[headerIndex++];
      return (
        <Typography key={key} id={section?.id} component="h2" className="canvas-article-section">
          {element.text}
        </Typography>
      );
    }
    if (element.type === 'subHeader') {
      return (
        <Typography key={key} component="h3" className="canvas-article-subhead">
          {element.text}
        </Typography>
      );
    }
    if (element.type === 'text') {
      return (
        <Typography key={key} component="p" className="canvas-article-paragraph">
          {renderRichText(element.text ?? '')}
        </Typography>
      );
    }
    if (element.type === 'code' && element.code) {
      return (
        <Box key={key} className="canvas-article-code">
          <CodeBlockItem codeText={element.code} />
        </Box>
      );
    }
    if (element.type === 'diagram' && element.code) {
      return (
        <Box key={key} className="canvas-article-diagram-wrap">
          <DiagramBlock source={element.code} />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'layer-weights') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <LayerWeightViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'gpu-matmul-parallel') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <GpuMatmulParallelViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'quant-bit-width') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <QuantBitWidthViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'quant-granularity') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <QuantGranularityViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'quant-story-path') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <QuantStoryPathViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'dataset-goal-map') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <DatasetGoalMapViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'dataset-format') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <DatasetFormatViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'dataset-kind-compare') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <DatasetKindCompareViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'dataset-model-template') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <DatasetModelTemplateViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'llama-cpp-need') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <LlamaCppNeedViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'llama-cpp-arch') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <LlamaCppArchViz />
        </Box>
      );
    }
    if (element.type === 'viz' && element.viz === 'llama-cpp-compare') {
      return (
        <Box key={key} className="canvas-article-viz-wrap">
          <LlamaCppCompareViz />
        </Box>
      );
    }
    if (element.type === 'image' && element.src) {
      return (
        <Box key={key} className="canvas-article-image">
          <Image src={element.src} width="100%" />
        </Box>
      );
    }
    if (element.type === 'link' && element.href) {
      const internalPath = element.href.replace(/^#/, '');
      return (
        <RouterLink key={key} to={internalPath} className="canvas-article-link">
          <span>Go to</span>
          <strong>{element.text}</strong>
        </RouterLink>
      );
    }
    if (element.type === 'reference' && element.href) {
      return (
        <Link
          key={key}
          href={element.href}
          target="_blank"
          rel="noreferrer"
          className="canvas-article-reference"
        >
          <span>External reference</span>
          <strong>{element.text}</strong>
        </Link>
      );
    }
    return null;
  });

  return (
    <Box className="app-content-page canvas-blog-page canvas-article-page">
      <Box className="canvas-blog-shell canvas-article-shell">
        <header className="canvas-blog-masthead canvas-blog-masthead--light">
          <button type="button" className="canvas-blog-brand" onClick={() => navigate('/ai-blog-items')}>
            Neurosentia
          </button>
          <nav className="canvas-blog-nav" aria-label="Blog sections">
            <button type="button" onClick={() => navigate('/ai-blog-items')}>Latest</button>
            <button type="button" onClick={() => navigate('/fine-tuning-techniques')}>Fine-tuning</button>
            <button type="button" onClick={() => navigate('/lora-fine-tuning')}>LoRA</button>
            <button type="button" onClick={() => navigate('/llm-model-files')}>Model files</button>
            <button type="button" onClick={() => navigate('/gpu-llm-inference')}>GPUs</button>
            <button type="button" onClick={() => navigate('/llm-quantization')}>Quantization</button>
            <button type="button" onClick={() => navigate('/llm-datasets')}>Datasets</button>
            <button type="button" onClick={() => navigate('/llama-cpp')}>llama.cpp</button>
            <button type="button" onClick={() => navigate('/ai-agents')}>Agents</button>
          </nav>
        </header>

        <section className="canvas-article-hero">
          <div className="canvas-article-hero__meta">
            <span>July 2026</span>
            <span>{estimateReadTime(item)}</span>
          </div>
          <div className="canvas-article-hero__row">
            <Typography component="h1">{item.header}</Typography>
            <div className="canvas-article-share" aria-hidden>
              <span className="canvas-blog-orb">↗</span>
              <span className="canvas-blog-orb">✕</span>
              <span className="canvas-blog-orb">f</span>
            </div>
          </div>
        </section>

        <Box className="canvas-article-layout">
          <Typography component="p" className="canvas-article-lead">
            {item.text}
          </Typography>
          <aside className="canvas-article-toc">
            <span className="canvas-article-accent-orb" aria-hidden />
            <Typography component="p" className="canvas-article-toc__label">
              In this article
            </Typography>
            <nav>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="canvas-article-toc__link"
                  onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  {section.label}
                </button>
              ))}
            </nav>
            <div className="canvas-article-byline">
              <span>Author: Neurosentia</span>
              <span>Field notes · 2026</span>
            </div>
          </aside>
          <article className="canvas-article-content">{contentItems}</article>
        </Box>
      </Box>
    </Box>
  );
}
