import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function VideoToAudio() {
  const tool = TOOLS.find((t) => t.id === 'video-to-audio');
  return <ToolLayout tool={tool} />;
}
