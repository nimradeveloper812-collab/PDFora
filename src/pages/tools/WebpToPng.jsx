import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function WebpToPng() {
  const tool = TOOLS.find((t) => t.id === 'webp-to-png') || TOOLS.find((t) => t.id === 'image-converter');
  return <ToolLayout tool={tool} />;
}
