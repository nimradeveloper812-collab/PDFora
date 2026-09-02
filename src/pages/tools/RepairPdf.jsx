import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function RepairPdf() {
  const tool = TOOLS.find((t) => t.id === 'repair-pdf');
  return <ToolLayout tool={tool} />;
}
