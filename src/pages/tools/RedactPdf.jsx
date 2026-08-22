import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function RedactPdf() {
  const tool = TOOLS.find((t) => t.id === 'redact-pdf');
  return <ToolLayout tool={tool} />;
}
