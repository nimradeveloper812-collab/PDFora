import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ExtractPagesPdf() {
  const tool = TOOLS.find((t) => t.id === 'extract-pages-pdf');
  return <ToolLayout tool={tool} />;
}
