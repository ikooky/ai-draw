"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "@/components/chat-input";
import { ChatMessageDisplay } from "./chat-message-display";
import { useDiagram } from "@/contexts/diagram-context";
import { replaceNodes, formatXML } from "@/lib/utils";
import { ButtonWithTooltip } from "@/components/button-with-tooltip";

interface ChatPanelProps {
    isVisible: boolean;
    onToggleVisibility: () => void;
    isMobileView?: boolean;
    isTabletView?: boolean;
}

export default function ChatPanel({ isVisible, onToggleVisibility, isMobileView = false, isTabletView = false }: ChatPanelProps) {
    const {
        loadDiagram: onDisplayChart,
        handleExport: onExport,
        resolverRef,
        chartXML,
        clearDiagram,
    } = useDiagram();

    const onFetchChart = () => {
        return Promise.race([
            new Promise<string>((resolve) => {
                if (resolverRef && "current" in resolverRef) {
                    resolverRef.current = resolve;
                }
                onExport();
            }),
            new Promise<string>((_, reject) =>
                setTimeout(() => reject(new Error("Chart export timed out after 10 seconds")), 10000)
            )
        ]);
    };
    // Add a step counter to track updates

    // Add state for file attachments
    const [files, setFiles] = useState<File[]>([]);
    // Add state for showing the history dialog
    const [showHistory, setShowHistory] = useState(false);
    // Add state for selected model - initialize from localStorage
    const [selectedModel, setSelectedModel] = useState<string | undefined>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selectedModelId') || undefined;
        }
        return undefined;
    });

    // Convert File[] to FileList for experimental_attachments
    const createFileList = (files: File[]): FileList => {
        const dt = new DataTransfer();
        files.forEach((file) => dt.items.add(file));
        return dt.files;
    };

    // Add state for input management
    const [input, setInput] = useState("");

    // Remove the currentXmlRef and related useEffect
    const { messages, sendMessage, addToolResult, status, error, setMessages } =
        useChat({
            transport: new DefaultChatTransport({
                api: "/api/chat",
            }),
            async onToolCall({ toolCall }) {
                if (toolCall.toolName === "display_diagram") {
                    // Diagram is handled streamingly in the ChatMessageDisplay component
                    addToolResult({
                        tool: "display_diagram",
                        toolCallId: toolCall.toolCallId,
                        output: "Successfully displayed the diagram.",
                    });
                } else if (toolCall.toolName === "edit_diagram") {
                    const { edits } = toolCall.input as {
                        edits: Array<{ search: string; replace: string }>;
                    };

                    let currentXml = '';
                    try {
                        // Fetch current chart XML
                        currentXml = await onFetchChart();

                        // Apply edits using the utility function
                        const { replaceXMLParts } = await import("@/lib/utils");
                        const editedXml = replaceXMLParts(currentXml, edits);

                        // Load the edited diagram
                        onDisplayChart(editedXml);

                        addToolResult({
                            tool: "edit_diagram",
                            toolCallId: toolCall.toolCallId,
                            output: `Successfully applied ${edits.length} edit(s) to the diagram.`,
                        });
                    } catch (error) {
                        console.error("Edit diagram failed:", error);

                        const errorMessage = error instanceof Error ? error.message : String(error);

                        // Provide detailed error with current diagram XML
                        addToolResult({
                            tool: "edit_diagram",
                            toolCallId: toolCall.toolCallId,
                            output: `Edit failed: ${errorMessage}

Current diagram XML:
\`\`\`xml
${currentXml}
\`\`\`

Please retry with an adjusted search pattern or use display_diagram if retries are exhausted.`,
                        });
                    }
                }
            },
            onError: (error) => {
                console.error("Chat error:", error);
            },
        });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Debug: Log status changes
    useEffect(() => {
        console.log('[ChatPanel] Status changed to:', status);
    }, [status]);

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isProcessing = status === "streaming" || status === "submitted";
        if (input.trim() && !isProcessing) {
            try {
                // Fetch chart data before sending message
                let chartXml = await onFetchChart();

                // Format the XML to ensure consistency
                chartXml = formatXML(chartXml);

                // Create message parts
                const parts: any[] = [{ type: "text", text: input }];

                // Add file parts if files exist
                if (files.length > 0) {
                    for (const file of files) {
                        const reader = new FileReader();
                        const dataUrl = await new Promise<string>((resolve) => {
                            reader.onload = () =>
                                resolve(reader.result as string);
                            reader.readAsDataURL(file);
                        });

                        parts.push({
                            type: "file",
                            url: dataUrl,
                            mediaType: file.type,
                        });
                    }
                }

                sendMessage(
                    { parts },
                    {
                        body: {
                            xml: chartXml,
                            modelId: selectedModel,
                        },
                    }
                );

                // Clear input and files after submission
                setInput("");
                setFiles([]);
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
        }
    };

    // Handle input change
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setInput(e.target.value);
    };

    // Helper function to handle file changes
    const handleFileChange = (newFiles: File[]) => {
        setFiles(newFiles);
    };

    // Collapsed view when chat is hidden (desktop/tablet only)
    if (!isVisible && !isMobileView) {
        return (
            <Card className={`h-full flex flex-col ${isTabletView ? 'rounded-xl' : 'rounded-xl'} py-0 gap-0 items-center justify-start pt-4 shadow-lg border-border/50`}>
                <ButtonWithTooltip
                    tooltipContent={`Show chat panel ${isTabletView ? '' : '(Ctrl+B)'}`}
                    variant="ghost"
                    size="icon"
                    onClick={onToggleVisibility}
                    className="hover:bg-primary/10 transition-colors"
                >
                    <PanelRightOpen className="h-5 w-5" />
                </ButtonWithTooltip>
                <div
                    className="text-sm text-muted-foreground mt-8 font-medium"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                    Chat
                </div>
            </Card>
        );
    }

    // Full view when chat is visible
    return (
        <Card className={`h-full flex flex-col ${isMobileView ? 'rounded-lg' : isTabletView ? 'rounded-xl' : 'rounded-xl'} py-0 gap-0 shadow-xl border-border/50 overflow-hidden`}>
            <CardHeader className="p-4 flex flex-row justify-between items-center border-b border-border/50 bg-card/95 backdrop-blur-sm">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    AI Draw
                </CardTitle>
                <div className="flex items-center gap-2">
                    {!isMobileView && (
                        <ButtonWithTooltip
                            tooltipContent={`Hide chat panel ${isTabletView ? '' : '(Ctrl+B)'}`}
                            variant="ghost"
                            size="icon"
                            onClick={onToggleVisibility}
                            className="hover:bg-primary/10 transition-colors"
                        >
                            <PanelRightClose className="h-5 w-5" />
                        </ButtonWithTooltip>
                    )}
                    <a
                        href="https://github.com/ikooky/ai-draw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                        <FaGithub className="w-5 h-5" />
                    </a>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden px-2 bg-gradient-to-b from-card/50 to-card">
                <ChatMessageDisplay
                    messages={messages}
                    error={error}
                    setInput={setInput}
                    setFiles={handleFileChange}
                />
            </CardContent>

            <CardFooter className="p-2 border-t border-border/30 bg-card/95 backdrop-blur-sm">
                <ChatInput
                    input={input}
                    status={status}
                    onSubmit={onFormSubmit}
                    onChange={handleInputChange}
                    onClearChat={() => {
                        setMessages([]);
                        clearDiagram();
                    }}
                    files={files}
                    onFileChange={handleFileChange}
                    showHistory={showHistory}
                    onToggleHistory={setShowHistory}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                />
            </CardFooter>
        </Card>
    );
}
