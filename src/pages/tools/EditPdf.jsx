import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function EditPdf() {
  const tool = TOOLS.find((t) => t.id === 'edit-pdf');
  return <ToolLayout tool={tool} />;
}
