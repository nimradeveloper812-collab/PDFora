import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function JsonFormatter() {
  const tool = TOOLS.find((t) => t.id === 'json-formatter');
  return <ToolLayout tool={tool} />;
}
