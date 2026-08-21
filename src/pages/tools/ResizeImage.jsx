import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ResizeImage() {
  const tool = TOOLS.find((t) => t.id === 'resize-image');
  return <ToolLayout tool={tool} />;
}
