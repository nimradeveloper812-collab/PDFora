import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function PdfMetadataEditor() {
  const tool = TOOLS.find((t) => t.id === 'pdf-metadata-editor');
  return <ToolLayout tool={tool} />;
}
