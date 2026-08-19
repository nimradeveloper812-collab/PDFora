import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ExcelToWord() {
  const tool = TOOLS.find((t) => t.id === 'excel-to-word');
  return <ToolLayout tool={tool} />;
}
