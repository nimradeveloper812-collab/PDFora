import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function TiffToJpg() {
  const tool = TOOLS.find((t) => t.id === 'tiff-to-jpg') || TOOLS.find((t) => t.id === 'image-converter');
  return <ToolLayout tool={tool} />;
}
