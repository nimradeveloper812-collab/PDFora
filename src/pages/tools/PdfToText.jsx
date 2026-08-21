import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfToText() {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-text');
  return <ToolLayout tool={tool} />;
}
