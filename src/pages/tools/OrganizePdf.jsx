import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function OrganizePdf() {
  const tool = TOOLS.find((t) => t.id === 'organize-pdf');
  return <ToolLayout tool={tool} />;
}
