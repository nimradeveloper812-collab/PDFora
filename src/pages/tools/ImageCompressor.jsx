import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ImageCompressor() {
  const tool = TOOLS.find((t) => t.id === 'image-compressor');
  return <ToolLayout tool={tool} />;
}
