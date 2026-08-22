import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PngToSvg() {
  const tool = TOOLS.find((t) => t.id === 'png-to-svg');
  return <ToolLayout tool={tool} />;
}
