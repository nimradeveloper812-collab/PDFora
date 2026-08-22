import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ImageBackgroundRemover() {
  const tool = TOOLS.find((t) => t.id === 'image-background-remover');
  return <ToolLayout tool={tool} />;
}
