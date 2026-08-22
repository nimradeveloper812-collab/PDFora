import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function WatermarkPdf() {
  const tool = TOOLS.find((t) => t.id === 'watermark-pdf');
  return <ToolLayout tool={tool} />;
}
