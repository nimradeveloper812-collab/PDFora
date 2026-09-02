import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function CropPdf() {
  const tool = TOOLS.find((t) => t.id === 'crop-pdf');
  return <ToolLayout tool={tool} />;
}
