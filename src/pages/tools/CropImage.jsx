import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function CropImage() {
  const tool = TOOLS.find((t) => t.id === 'crop-image');
  return <ToolLayout tool={tool} />;
}
