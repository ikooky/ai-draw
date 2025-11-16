"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import ExamplePanel from "./chat-example-panel";
import { UIMessage } from "ai";
import { convertToLegalXml, replaceNodes } from "@/lib/utils";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";

import { useDiagram } from "@/contexts/diagram-context";

interface ChatMessageDisplayProps {
    messages: UIMessage[];
    error?: Error | null;
    setInput: (input: string) => void;
    setFiles: (files: File[]) => void;
    isLoading?: boolean;
}

export function ChatMessageDisplay({
    messages,
    error,
    setInput,
    setFiles,
    isLoading = false,
}: ChatMessageDisplayProps) {
    const { chartXML, loadDiagram: onDisplayChart } = useDiagram();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const previousXML = useRef<string>("");
    const processedToolCalls = useRef<Set<string>>(new Set());
    const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>(
        {}
    );
    const [thinkingExpanded, setThinkingExpanded] = useState<Record<string, boolean>>({});
    const handleDisplayChart = useCallback(
        (xml: string) => {
            const currentXml = xml || "";
            const convertedXml = convertToLegalXml(currentXml);
            if (convertedXml !== previousXML.current) {
                previousXML.current = convertedXml;
                const replacedXML = replaceNodes(chartXML, convertedXml);
                onDisplayChart(replacedXML);
            }
        },
        [chartXML, onDisplayChart]
    );

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Handle tool invocations and update diagram when needed
    useEffect(() => {
        messages.forEach((message) => {
            if (message.parts) {
                message.parts.forEach((part: any) => {
                    if (part.type?.startsWith("tool-")) {
                        const { toolCallId, state } = part;

                        // Auto-collapse args when diagrams are generated
                        if (state === "output-available") {
                            setExpandedTools((prev) => ({
                                ...prev,
                                [toolCallId]: false,
                            }));
                        }

                        // Handle diagram updates for display_diagram tool
                        if (
                            part.type === "tool-display_diagram" &&
                            part.input?.xml
                        ) {
                            // For streaming input, always update to show streaming
                            if (
                                state === "input-streaming" ||
                                state === "input-available"
                            ) {
                                handleDisplayChart(part.input.xml);
                            }
                            // For completed calls, only update if not processed yet
                            else if (
                                state === "output-available" &&
                                !processedToolCalls.current.has(toolCallId)
                            ) {
                                handleDisplayChart(part.input.xml);
                                processedToolCalls.current.add(toolCallId);
                            }
                        }
                    } else if (part.type === "text" && message.role === "assistant") {
                        // Handle XML in markdown code blocks for models without tool support
                        const xmlCodeBlockRegex = /```xml\s*\n([\s\S]*?)\n```/;
                        const match = part.text?.match(xmlCodeBlockRegex);

                        if (match && match[1]) {
                            const extractedXml = match[1].trim();
                            // Use message.id as a unique identifier for text-based XML
                            const textXmlId = `text-xml-${message.id}`;

                            if (!processedToolCalls.current.has(textXmlId)) {
                                handleDisplayChart(extractedXml);
                                processedToolCalls.current.add(textXmlId);
                            }
                        }
                    }
                });
            }
        });
    }, [messages, handleDisplayChart]);

    const renderToolPart = (part: any) => {
        const callId = part.toolCallId;
        const { state, input, output } = part;
        const isExpanded = expandedTools[callId] ?? true;
        const toolName = part.type?.replace("tool-", "");

        const toggleExpanded = () => {
            setExpandedTools((prev) => ({
                ...prev,
                [callId]: !isExpanded,
            }));
        };

        // Get display names for tools
        const toolDisplayNames: Record<string, string> = {
            display_diagram: "生成图表",
            edit_diagram: "编辑图表",
        };

        const displayName = toolDisplayNames[toolName || ""] || toolName;

        return (
            <div
                key={callId}
                className="p-3 my-2 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm"
            >
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium">
                            {state === "input-streaming" ? (
                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            ) : state === "output-available" ? (
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                            ) : state === "output-error" ? (
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                            ) : null}
                            <span className="text-muted-foreground">{displayName}</span>
                        </div>
                        {input && Object.keys(input).length > 0 && (
                            <button
                                onClick={toggleExpanded}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {isExpanded ? "隐藏参数" : "显示参数"}
                            </button>
                        )}
                    </div>
                    {input && isExpanded && (
                        <div className="mt-1 font-mono text-xs overflow-hidden bg-muted/50 p-2 rounded border border-border/30 max-h-40 overflow-y-auto">
                            {typeof input === "object" &&
                                Object.keys(input).length > 0 &&
                                JSON.stringify(input, null, 2)}
                        </div>
                    )}
                    <div className="text-xs">
                        {state === "input-streaming" ? (
                            <div className="flex items-center gap-2 text-primary">
                                <span className="animate-pulse">正在生成...</span>
                            </div>
                        ) : state === "input-available" ? (
                            <div className="flex items-center gap-2 text-primary">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>执行中...</span>
                            </div>
                        ) : state === "output-available" ? (
                            <div className="text-green-600 font-medium">
                                ✓ {output || (toolName === "display_diagram"
                                    ? "图表已生成"
                                    : toolName === "edit_diagram"
                                    ? "图表已编辑"
                                    : "执行成功")}
                            </div>
                        ) : state === "output-error" ? (
                            <div className="text-red-600 font-medium">
                                ✗ {output || (toolName === "display_diagram"
                                    ? "生成图表时出错"
                                    : toolName === "edit_diagram"
                                    ? "编辑图表时出错"
                                    : "执行出错")}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ScrollArea className="h-full pr-4">
            {messages.length === 0 ? (
                <ExamplePanel setInput={setInput} setFiles={setFiles} />
            ) : (
                <>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`mb-4 ${
                                message.role === "user" ? "text-right" : "text-left"
                            }`}
                        >
                            {/* Display thinking content if available */}
                            {message.role === "assistant" && (message as any).experimental_providerMetadata?.anthropic?.thinking && (
                                <div className="mb-2 border border-blue-200 rounded-lg bg-blue-50/50 overflow-hidden max-w-[85%] inline-block">
                                    <button
                                        onClick={() => {
                                            const thinkingKey = `thinking-${message.id}`;
                                            setThinkingExpanded(prev => ({
                                                ...prev,
                                                [thinkingKey]: !prev[thinkingKey]
                                            }));
                                        }}
                                        className="w-full px-3 py-2 flex items-center gap-2 text-left text-xs text-blue-700 hover:bg-blue-100/50 transition-colors"
                                    >
                                        {thinkingExpanded[`thinking-${message.id}`] ? (
                                            <ChevronDown className="h-3 w-3" />
                                        ) : (
                                            <ChevronRight className="h-3 w-3" />
                                        )}
                                        <span className="font-medium">💭 思考过程</span>
                                    </button>
                                    {thinkingExpanded[`thinking-${message.id}`] && (
                                        <div className="px-3 py-2 text-xs text-blue-800 whitespace-pre-wrap border-t border-blue-200 bg-blue-50/30 max-h-64 overflow-y-auto">
                                            {(message as any).experimental_providerMetadata.anthropic.thinking}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div
                                className={`inline-block px-4 py-2 whitespace-pre-wrap text-sm rounded-lg max-w-[85%] break-words ${
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                }`}
                            >
                                {message.parts?.map((part: any, index: number) => {
                                    switch (part.type) {
                                        case "text":
                                            return (
                                                <div key={index}>{part.text}</div>
                                            );
                                        case "file":
                                            return (
                                                <div key={index} className="mt-2">
                                                    <Image
                                                        src={part.url}
                                                        width={200}
                                                        height={200}
                                                        alt={`file-${index}`}
                                                        className="rounded-md border"
                                                        style={{
                                                            objectFit: "contain",
                                                        }}
                                                    />
                                                </div>
                                            );
                                        case "thinking":
                                            const thinkingKey = `${message.id}-${index}`;
                                            const isThinkingExpanded = thinkingExpanded[thinkingKey] ?? false;
                                            return (
                                                <div key={index} className="mt-2 border border-blue-200 rounded-lg bg-blue-50/50 overflow-hidden">
                                                    <button
                                                        onClick={() => setThinkingExpanded(prev => ({
                                                            ...prev,
                                                            [thinkingKey]: !isThinkingExpanded
                                                        }))}
                                                        className="w-full px-3 py-2 flex items-center gap-2 text-left text-xs text-blue-700 hover:bg-blue-100/50 transition-colors"
                                                    >
                                                        {isThinkingExpanded ? (
                                                            <ChevronDown className="h-3 w-3" />
                                                        ) : (
                                                            <ChevronRight className="h-3 w-3" />
                                                        )}
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        <span className="font-medium">思考过程</span>
                                                    </button>
                                                    {isThinkingExpanded && part.text && (
                                                        <div className="px-3 py-2 text-xs text-blue-800 whitespace-pre-wrap border-t border-blue-200 bg-blue-50/30 max-h-64 overflow-y-auto">
                                                            {part.text}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        default:
                                            if (part.type?.startsWith("tool-")) {
                                                return renderToolPart(part);
                                            }
                                            return null;
                                    }
                                })}
                            </div>
                        </div>
                    ))}
                </>
            )}
            {error && (
                <div className="text-red-500 text-sm mt-2">
                    Error: {error.message}
                </div>
            )}
            <div ref={messagesEndRef} />
        </ScrollArea>
    );
}
