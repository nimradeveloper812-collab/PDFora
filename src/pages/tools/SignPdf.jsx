import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function SignPdf() {
  const tool = TOOLS.find((t) => t.id === 'sign-pdf');
  return <ToolLayout tool={tool} />;
}
