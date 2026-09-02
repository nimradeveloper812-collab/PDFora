import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ScanToPdf() {
  const tool = TOOLS.find((t) => t.id === 'scan-to-pdf');
  return <ToolLayout tool={tool} />;
}
