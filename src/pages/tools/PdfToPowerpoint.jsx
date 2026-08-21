import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfToPowerpoint() {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-powerpoint');
  return <ToolLayout tool={tool} />;
}
