import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function WordToPdf() {
  const tool = TOOLS.find((t) => t.id === 'word-to-pdf');
  return <ToolLayout tool={tool} />;
}
