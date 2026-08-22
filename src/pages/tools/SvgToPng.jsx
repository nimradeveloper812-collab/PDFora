import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function SvgToPng() {
  const tool = TOOLS.find((t) => t.id === 'svg-to-png') || TOOLS.find((t) => t.id === 'image-converter');
  return <ToolLayout tool={tool} />;
}
