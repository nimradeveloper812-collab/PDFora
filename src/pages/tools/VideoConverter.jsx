import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function VideoConverter() {
  const tool = TOOLS.find((t) => t.id === 'video-converter');
  return <ToolLayout tool={tool} />;
}
