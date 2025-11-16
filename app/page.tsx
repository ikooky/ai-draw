"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DrawIoEmbed } from "react-drawio";
import ChatPanel from "@/components/chat-panel";
import { useDiagram } from "@/contexts/diagram-context";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileEdit } from "lucide-react";

type ViewMode = "diagram" | "chat";

export default function Home() {
    const { drawioRef, handleDiagramExport } = useDiagram();
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [mobileView, setMobileView] = useState<ViewMode>("diagram");
    const [chatWidth, setChatWidth] = useState(33); // Chat panel width in percentage (default 33%)
    const [isResizing, setIsResizing] = useState(false);

    // 定义一个有效的初始 XML，避免解析错误
    const initialXML = `<mxfile><diagram name="Page-1" id="page-1"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`;

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };

        // Check on mount
        checkScreenSize();

        // Add event listener for resize
        window.addEventListener("resize", checkScreenSize);

        // Cleanup
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Add keyboard shortcut for toggling chat panel (Ctrl+B)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                setIsChatVisible((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Handle resizing with callbacks
    const handleMouseMove = useCallback((e: MouseEvent) => {
        e.preventDefault();
        const newChatWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
        // Constrain between 20% and 60%
        if (newChatWidth >= 20 && newChatWidth <= 60) {
            setChatWidth(newChatWidth);
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';
    }, []);

    const handleMouseDown = useCallback(() => {
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.body.style.pointerEvents = 'none';
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    // Mobile Layout: Single view with toggle buttons
    if (isMobile) {
        return (
            <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Mobile View Switcher */}
                <div className="flex justify-center gap-2 p-3 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                    <Button
                        variant={mobileView === "diagram" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMobileView("diagram")}
                        className="flex-1 max-w-[160px] transition-all duration-200"
                    >
                        <FileEdit className="mr-2 h-4 w-4" />
                        Diagram
                    </Button>
                    <Button
                        variant={mobileView === "chat" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMobileView("chat")}
                        className="flex-1 max-w-[160px] transition-all duration-200"
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden p-1">
                    {mobileView === "diagram" ? (
                        <div className="h-full rounded-lg overflow-hidden shadow-lg">
                            <DrawIoEmbed
                                ref={drawioRef}
                                onExport={handleDiagramExport}
                                xml={initialXML}
                                urlParameters={{
                                    spin: true,
                                    libraries: false,
                                    saveAndExit: false,
                                    noExitBtn: true,
                                }}
                            />
                        </div>
                    ) : (
                        <ChatPanel
                            isVisible={true}
                            onToggleVisibility={() => setMobileView("diagram")}
                            isMobileView={true}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Tablet Layout: Vertical split
    if (isTablet) {
        return (
            <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Diagram Area - Top */}
                <div className={`${isChatVisible ? 'h-1/2' : 'h-full'} p-2 transition-all duration-300 ease-in-out`}>
                    <div className="h-full rounded-xl overflow-hidden shadow-lg">
                        <DrawIoEmbed
                            ref={drawioRef}
                            onExport={handleDiagramExport}
                            xml={initialXML}
                            urlParameters={{
                                spin: true,
                                libraries: false,
                                saveAndExit: false,
                                noExitBtn: true,
                            }}
                        />
                    </div>
                </div>

                {/* Chat Panel - Bottom */}
                <div className={`${isChatVisible ? 'h-1/2' : 'h-16'} p-2 pt-0 transition-all duration-300 ease-in-out`}>
                    <ChatPanel
                        isVisible={isChatVisible}
                        onToggleVisibility={() => setIsChatVisible(!isChatVisible)}
                        isTabletView={true}
                    />
                </div>
            </div>
        );
    }

    // Desktop Layout: Horizontal split with resizable divider
    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            {/* Diagram Area - Left */}
            <div
                className="p-2 h-full relative"
                style={{
                    width: isChatVisible ? `${100 - chatWidth}%` : 'calc(100% - 4rem)',
                    transition: isResizing ? 'none' : 'width 300ms ease-in-out'
                }}
            >
                <div className="h-full rounded-xl overflow-hidden shadow-xl">
                    <DrawIoEmbed
                        ref={drawioRef}
                        onExport={handleDiagramExport}
                        xml={initialXML}
                        urlParameters={{
                            spin: true,
                            libraries: false,
                            saveAndExit: false,
                            noExitBtn: true,
                        }}
                    />
                </div>
            </div>

            {/* Resize Handle */}
            {isChatVisible && (
                <div
                    className="w-1 hover:w-1.5 bg-slate-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 my-2 rounded-full active:bg-blue-600"
                    onMouseDown={handleMouseDown}
                    style={{ pointerEvents: 'auto' }}
                />
            )}

            {/* Chat Panel - Right */}
            <div
                className="h-full p-2 pl-0"
                style={{
                    width: isChatVisible ? `${chatWidth}%` : '4rem',
                    transition: isResizing ? 'none' : 'width 300ms ease-in-out'
                }}
            >
                <ChatPanel
                    isVisible={isChatVisible}
                    onToggleVisibility={() => setIsChatVisible(!isChatVisible)}
                />
            </div>
        </div>
    );
}
