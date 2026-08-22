import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function AiPdfSummarizer() {
  const tool = TOOLS.find((t) => t.id === 'ai-pdf-summarizer');
  return <ToolLayout tool={tool} />;
}
