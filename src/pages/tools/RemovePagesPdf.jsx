import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function RemovePagesPdf() {
  const tool = TOOLS.find((t) => t.id === 'remove-pages-pdf');
  return <ToolLayout tool={tool} />;
}
