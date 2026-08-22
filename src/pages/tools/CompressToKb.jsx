import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function CompressToKb() {
  const tool = TOOLS.find((t) => t.id === 'compress-to-kb');
  return <ToolLayout tool={tool} />;
}
