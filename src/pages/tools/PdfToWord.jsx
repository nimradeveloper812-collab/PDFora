import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfToWord() {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-word');
  return <ToolLayout tool={tool} />;
}
