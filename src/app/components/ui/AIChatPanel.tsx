import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useMeetingStore } from "../../../store/useMeetingStore";
import { useDataStore } from "../../../store/useDataStore";
import { askAIChatbot } from "../../utils/llmService";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your AI Teaching Assistant. Do you have any questions about the current lecture?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transcript = useMeetingStore((state) => state.transcript);
  const liveSessionId = useMeetingStore((state) => state.liveSessionId);
  const activeDocumentName = useMeetingStore((state) => state.activeDocumentName);
  const sessions = useDataStore((state) => state.sessions);
  const currentSession = sessions.find((s) => s.id === liveSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    const transcriptText = transcript.map(t => t.text).join(" ");
    const subject = currentSession?.course || "General Topic";
    const activeMaterial = currentSession?.materials?.find(m => m.name === activeDocumentName) || currentSession?.materials?.[0];
    const materialText = activeMaterial?.textContents || activeMaterial?.slidesText?.join('\n') || "";

    try {
      const response = await askAIChatbot(userMsg, transcriptText, subject, messages, materialText);
      setMessages([...newMessages, { role: "ai", content: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: "ai", content: "Sorry, I encountered an error connecting to the AI." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 z-50 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-card border border-indigo-500/30 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden" style={{ height: '500px', maxHeight: '80vh' }}>
          {/* Header */}
          <div className="bg-indigo-600/10 border-b border-indigo-500/20 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">AI Teaching Assistant</h3>
                <p className="text-[10px] text-indigo-300">Context-aware support</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 ${msg.role === "user" ? "bg-primary/20" : "bg-indigo-500/20"}`}>
                  {msg.role === "user" ? <User className="w-3 h-3 text-primary" /> : <Bot className="w-3 h-3 text-indigo-400" />}
                </div>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground border border-border rounded-tl-none"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 flex-row">
                <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 bg-indigo-500/20">
                  <Bot className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="p-3 rounded-2xl bg-muted text-foreground border border-border rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-card border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about the lecture..."
                className="flex-1 bg-input border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
