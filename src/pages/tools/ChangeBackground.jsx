import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ChangeBackground() {
  const tool = TOOLS.find((t) => t.id === 'change-background');
  return <ToolLayout tool={tool} />;
}
