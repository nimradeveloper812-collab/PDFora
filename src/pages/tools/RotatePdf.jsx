import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function RotatePdf() {
  const tool = TOOLS.find((t) => t.id === 'rotate-pdf');
  return <ToolLayout tool={tool} />;
}
