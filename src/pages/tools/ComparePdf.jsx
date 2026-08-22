import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ComparePdf() {
  const tool = TOOLS.find((t) => t.id === 'compare-pdf');
  return <ToolLayout tool={tool} />;
}
