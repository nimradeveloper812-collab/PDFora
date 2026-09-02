import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function QrGenerator() {
  const tool = TOOLS.find((t) => t.id === 'qr-generator');
  return <ToolLayout tool={tool} />;
}
