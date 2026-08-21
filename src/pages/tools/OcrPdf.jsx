import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function OcrPdf() {
  const tool = TOOLS.find((t) => t.id === 'ocr-pdf');
  return <ToolLayout tool={tool} />;
}
