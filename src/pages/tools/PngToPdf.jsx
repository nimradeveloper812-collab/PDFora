import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PngToPdf() {
  const tool = TOOLS.find((t) => t.id === 'png-to-pdf') || TOOLS.find((t) => t.id === 'jpg-to-pdf');
  return <ToolLayout tool={tool} />;
}
