import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';

type ServiceItem = {
  icon: ReactNode;
  title: string;
  description: string;
  outcome: string;
  tags: string[];
};

const services: ServiceItem[] = [
  {
    icon: <LanguageOutlinedIcon />,
    title: 'Scalable Web Applications',
    description:
      'We design, build, and deploy fast, production-grade websites and web applications — optimized for performance, reliability, and growth from day one.',
    outcome: 'Outcome: production-ready web app shipped in weeks, not months.',
    tags: ['React', 'Cloud deploy', 'Performance'],
  },
  {
    icon: <SmartToyOutlinedIcon />,
    title: 'AI Chatbots',
    description:
      'Custom conversational assistants for support, sales, and product experiences — trained on your domain and embedded where your users already work.',
    outcome: 'Outcome: domain-specific chatbot live in your product in 2–4 weeks.',
    tags: ['LLM chat', 'Custom bots', 'Integrations'],
  },
  {
    icon: <HubOutlinedIcon />,
    title: 'Agentic Flows',
    description:
      'Autonomous AI agents that reason through tasks, call tools and APIs, and execute multi-step workflows aligned with your business logic.',
    outcome: 'Outcome: automated multi-step workflows that call your APIs and tools.',
    tags: ['Tool use', 'Orchestration', 'Automation'],
  },
  {
    icon: <StorageOutlinedIcon />,
    title: 'RAG-Driven Solutions',
    description:
      'Retrieval-augmented pipelines that ground models in your documents, databases, and knowledge bases — delivering accurate, contextual answers at scale.',
    outcome: 'Outcome: RAG over your docs and data — accurate answers in 2–4 weeks.',
    tags: ['Vector search', 'Knowledge bases', 'Grounded AI'],
  },
];

function ServiceCard({
  icon,
  title,
  description,
  outcome,
  tags,
  index,
}: ServiceItem & { index: number }) {
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <Box className="service-card">
      <Box className="service-card-shine" aria-hidden="true" />
      <Box className="service-card-grid" aria-hidden="true" />
      <Box className="service-card-body">
        <span className="service-card-index">{indexLabel}</span>
        <Box className="service-card-icon" aria-hidden="true">
          <span className="service-card-icon-ring" />
          {icon}
        </Box>
        <Typography variant="h4" className="service-card-title">
          {title}
        </Typography>
        <Typography variant="body2" className="service-card-desc">
          {description}
        </Typography>
        <Typography variant="overline" className="service-card-outcome">
          {outcome}
        </Typography>
        <Box className="service-card-tags">
          {tags.map((tag) => (
            <span key={tag} className="service-card-tag">
              {tag}
            </span>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function ServicesOfferings() {
  return (
    <Box className="services-offerings">
      {services.map((service, index) => (
        <ServiceCard key={service.title} {...service} index={index} />
      ))}
    </Box>
  );
}

export default ServicesOfferings;
