import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function WordToExcel() {
  const tool = TOOLS.find((t) => t.id === 'word-to-excel');
  return <ToolLayout tool={tool} />;
}
