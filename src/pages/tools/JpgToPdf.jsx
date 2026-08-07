import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function JpgToPdf() {
  const tool = TOOLS.find((t) => t.id === 'jpg-to-pdf');
  return <ToolLayout tool={tool} />;
}
