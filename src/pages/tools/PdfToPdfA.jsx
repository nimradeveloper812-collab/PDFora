import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfToPdfA() {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-pdfa');
  return <ToolLayout tool={tool} />;
}
