import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function UnlockPdf() {
  const tool = TOOLS.find((t) => t.id === 'unlock-pdf');
  return <ToolLayout tool={tool} />;
}
