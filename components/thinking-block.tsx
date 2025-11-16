"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface ThinkingBlockProps {
  content: string;
  messageId: string;
  defaultOpen?: boolean;
}

export function ThinkingBlock({ content, messageId, defaultOpen = false }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update height when expanded state changes
  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, [isExpanded]);

  // Update height when content changes (for streaming)
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [content, isExpanded]);

  if (!content) return null;

  return (
    <div className="mb-2 w-full max-w-[85%] text-left">
      <div className="border border-blue-200 rounded-lg bg-blue-50/50 overflow-hidden shadow-sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center gap-2 text-left text-xs text-blue-700 hover:bg-blue-100/50 transition-all duration-200"
          aria-expanded={isExpanded}
          aria-controls={`thinking-content-${messageId}`}
        >
          <ChevronRight
            className={`h-3 w-3 flex-shrink-0 transition-transform duration-300 ease-out ${
              isExpanded ? 'rotate-90' : 'rotate-0'
            }`}
          />
          <span className="font-medium">💭 思考过程</span>
          {!isExpanded && (
            <span className="text-blue-600 ml-auto text-[10px]">点击展开</span>
          )}
        </button>
        <div
          id={`thinking-content-${messageId}`}
          style={{
            height: height,
            overflow: 'hidden',
            transition: 'height 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div
            ref={contentRef}
            className="px-3 py-2 text-xs text-blue-800 whitespace-pre-wrap border-t border-blue-200 bg-blue-50/30 max-h-96 overflow-y-auto"
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
