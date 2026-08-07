import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfToJpg() {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-jpg');
  return <ToolLayout tool={tool} />;
}
