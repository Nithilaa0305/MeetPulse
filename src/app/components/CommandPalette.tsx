import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Command, Radio, Sparkles, LogOut, Settings as SettingsIcon, BookOpen, Users, Brain, FileText, ArrowRight } from "lucide-react";

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onTriggerAction
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onTriggerAction: (action: string) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: "nav-overview", title: "Go to Dashboard Overview", category: "Navigation", icon: BookOpen, action: () => onNavigate("overview") },
    { id: "nav-live", title: "Launch / Join Live Presentation Screen", category: "Live Session", icon: Radio, action: () => onNavigate("live") },
    { id: "nav-analytics", title: "View Real-Time & Historical Analytics", category: "Analytics", icon: Brain, action: () => onNavigate("analytics") },
    { id: "nav-settings", title: "Open Account & Workspace Settings", category: "Account", icon: SettingsIcon, action: () => onNavigate("settings") },
    { id: "act-ai-summary", title: "Generate Instant AI Executive Summary", category: "AI Tools", icon: Sparkles, action: () => onTriggerAction("ai-summary") },
    { id: "act-ai-quiz", title: "Trigger AI Micro Quiz to Participants", category: "AI Tools", icon: Brain, action: () => onTriggerAction("ai-quiz") },
    { id: "act-export", title: "Export Meeting Minutes & Attendance PDF", category: "Reports", icon: FileText, action: () => onTriggerAction("export-pdf") },
  ];

  const filteredCommands = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 px-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: -10 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: -10 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl text-white"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
            <Search className="w-5 h-5 text-indigo-400 shrink-0" />
            <input 
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type a command or search (e.g. AI summary, live session)..."
              className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-400 font-medium"
            />
            <kbd className="hidden sm:flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No commands matching "{query}"
              </div>
            ) : (
              filteredCommands.map(cmd => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-indigo-600/30 hover:border-indigo-500/30 border border-transparent transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-indigo-200">{cmd.title}</p>
                        <p className="text-[10px] text-slate-400">{cmd.category}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3 text-indigo-400" /> MeetPulse Quick Navigator
            </span>
            <span>Use ↑ ↓ to navigate, ↵ to select</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
