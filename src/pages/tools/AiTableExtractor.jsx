import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function AiTableExtractor() {
  const tool = TOOLS.find((t) => t.id === 'ai-table-extractor');
  return <ToolLayout tool={tool} />;
}
