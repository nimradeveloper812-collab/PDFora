import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function Base64ToPdf() {
  const tool = TOOLS.find((t) => t.id === 'base64-to-pdf');
  return <ToolLayout tool={tool} />;
}
