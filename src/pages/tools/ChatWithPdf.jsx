import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function ChatWithPdf() {
  const tool = TOOLS.find((t) => t.id === 'chat-with-pdf');
  return <ToolLayout tool={tool} />;
}
