import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function AddPageNumbersPdf() {
  const tool = TOOLS.find((t) => t.id === 'add-page-numbers-pdf');
  return <ToolLayout tool={tool} />;
}
