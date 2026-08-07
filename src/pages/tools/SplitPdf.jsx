import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function SplitPdf() {
  const tool = TOOLS.find((t) => t.id === 'split-pdf');
  return <ToolLayout tool={tool} />;
}
