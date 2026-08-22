import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function JsonToCsv() {
  const tool = TOOLS.find((t) => t.id === 'json-to-csv');
  return <ToolLayout tool={tool} />;
}
