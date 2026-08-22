import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function HeicToPng() {
  const tool = TOOLS.find((t) => t.id === 'heic-to-png') || TOOLS.find((t) => t.id === 'image-converter');
  return <ToolLayout tool={tool} />;
}
