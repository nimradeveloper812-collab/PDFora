import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function AudioCompressor() {
  const tool = TOOLS.find((t) => t.id === 'audio-compressor');
  return <ToolLayout tool={tool} />;
}
