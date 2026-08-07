import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PowerPointToPdf() {
  const tool = TOOLS.find((t) => t.id === 'powerpoint-to-pdf');
  return <ToolLayout tool={tool} />;
}
