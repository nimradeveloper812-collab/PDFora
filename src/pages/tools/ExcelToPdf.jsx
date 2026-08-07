import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ExcelToPdf() {
  const tool = TOOLS.find((t) => t.id === 'excel-to-pdf');
  return <ToolLayout tool={tool} />;
}
