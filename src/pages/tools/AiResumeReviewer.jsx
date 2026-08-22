import React from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TOOLS } from '../../data/toolsData';

export default function AiResumeReviewer() {
  const tool = TOOLS.find((t) => t.id === 'ai-resume-reviewer');
  return <ToolLayout tool={tool} />;
}
