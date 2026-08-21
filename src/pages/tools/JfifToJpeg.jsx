import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function JfifToJpeg() {
  const tool = TOOLS.find((t) => t.id === 'jfif-to-jpeg') || TOOLS.find((t) => t.id === 'image-converter');
  return <ToolLayout tool={tool} />;
}
