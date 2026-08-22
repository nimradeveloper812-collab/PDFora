import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfToExcel() {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-excel');
  return <ToolLayout tool={tool} />;
}
