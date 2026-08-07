import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function CompressPdf() {
  const tool = TOOLS.find((t) => t.id === 'compress-pdf');
  return <ToolLayout tool={tool} />;
}
