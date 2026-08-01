import React from "react";
import { ShieldAlert } from "lucide-react";

import { useAuthStore } from "../../../store/useAuthStore";

export function BusinessEmployeeDashboard({
  activeTab,
  liveSessionId,
  setLiveSessionId,
  currentSlide,
  triggerReaction,
  askQuestion
}: {
  activeTab: string;
  liveSessionId: string | null;
  setLiveSessionId: (s: string | null) => void;
  currentSlide: number;
  triggerReaction: (e: string) => void;
  askQuestion: (t: string, a: boolean, n: string) => void;
}) {
  const user = useAuthStore(state => state.user);
  const userName = user?.name || "Employee";

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-950/40 to-[#111827] border border-blue-500/15 rounded-3xl p-6">
          <p className="text-xs text-blue-400 font-semibold mb-1">Employee Portal</p>
          <h2 className="text-2xl font-bold text-white">Hello, {userName}!</h2>
          <p className="text-xs text-slate-400 mt-1">2 meetings scheduled for today. Sync with the team Boardroom live.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-3xl p-5">
            <h4 className="font-bold text-xs text-muted-foreground uppercase mb-2">Smart Performance Attendance Score</h4>
            <p className="text-3xl font-extrabold text-foreground">88%</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-5">
            <h4 className="font-bold text-xs text-muted-foreground uppercase mb-3">Action Task Board</h4>
            <p className="text-xs">You have 5 action items from AI summaries pending completion.</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "live") {
    return (
      <div className="space-y-6">
        {!liveSessionId ? (
          <div className="text-center py-20 bg-card border border-border rounded-3xl space-y-4 max-w-sm mx-auto">
            <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm">No Active Live Boardroom</h4>
            <p className="text-xs text-muted-foreground">The boardroom is currently empty. Scan the manager's meeting QR code or click below to connect live.</p>
            <button onClick={() => {
              setLiveSessionId("MEET-99");
              alert("Joined Strategy Boardroom live! Slide sync is active.");
            }} className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Simulate QR Scan Join</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950 aspect-video rounded-3xl border border-border p-6 flex flex-col justify-between relative">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Q1 Strategy Boardroom</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">SYNCED BOARD</span>
                </div>
                
                <div className="my-auto text-center space-y-2">
                  <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-widest">Slide {currentSlide + 1} of 10</span>
                  <h2 className="text-xl font-bold text-white">Q1 Sprint Retrospective Summary</h2>
                  <p className="text-xs text-slate-400">Team velocity improvements and deployment metrics.</p>
                </div>

                <div className="flex justify-center gap-2">
                  {["😊", "🚀", "👏"].map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => triggerReaction(emoji)}
                      className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-lg cursor-pointer">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Submit Meeting Question</h4>
              <input id="bizQText" placeholder="Ask about sprint velocity metrics..." className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
              <button onClick={() => {
                const text = (document.getElementById("bizQText") as HTMLInputElement).value;
                if (text) {
                  askQuestion(text, false, userName);
                  (document.getElementById("bizQText") as HTMLInputElement).value = "";
                  alert("Question submitted!");
                }
              }} className="w-full bg-primary text-white py-2 rounded-xl text-xs font-semibold cursor-pointer">Submit Question</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "tasks") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-sm">Action Tasks Board</h3>
        <div className="space-y-2">
          <div className="p-3 bg-background border border-border rounded-xl text-xs flex justify-between items-center">
            <span>Optimize database indexing parameters</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">In Progress</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-3xl space-y-3">
      <p className="font-bold text-foreground">Welcome to Employee Workspace</p>
      <p>Select a tab from the sidebar to begin.</p>
    </div>
  );
}
