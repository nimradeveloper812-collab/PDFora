import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfToMarkdown() {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-markdown');
  return <ToolLayout tool={tool} />;
}
