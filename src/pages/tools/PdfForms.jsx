import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfForms() {
  const tool = TOOLS.find((t) => t.id === 'pdf-forms');
  return <ToolLayout tool={tool} />;
}
