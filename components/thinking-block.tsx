"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ThinkingBlockProps {
  content: string;
  messageId: string;
}

export function ThinkingBlock({ content, messageId }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  return (
    <div className="mb-2 w-full max-w-[85%] text-left">
      <div className="border border-blue-200 rounded-lg bg-blue-50/50 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-xs text-blue-700 hover:bg-blue-100/50 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
          )}
          <span className="font-medium">💭 思考过程</span>
          {!isExpanded && (
            <span className="text-blue-600 ml-auto">点击展开</span>
          )}
        </button>
        {isExpanded && (
          <div className="px-3 py-2 text-xs text-blue-800 whitespace-pre-wrap border-t border-blue-200 bg-blue-50/30 max-h-64 overflow-y-auto">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
