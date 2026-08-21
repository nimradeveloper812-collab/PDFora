import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function HtmlToPdf() {
  const tool = TOOLS.find((t) => t.id === 'html-to-pdf');
  return <ToolLayout tool={tool} />;
}
