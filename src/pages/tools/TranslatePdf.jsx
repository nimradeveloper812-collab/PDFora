import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function TranslatePdf() {
  const tool = TOOLS.find((t) => t.id === 'translate-pdf');
  return <ToolLayout tool={tool} />;
}
