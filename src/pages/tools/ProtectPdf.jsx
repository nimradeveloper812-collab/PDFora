import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ProtectPdf() {
  const tool = TOOLS.find((t) => t.id === 'protect-pdf');
  return <ToolLayout tool={tool} />;
}
