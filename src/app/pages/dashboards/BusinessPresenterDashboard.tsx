import React from "react";
import { Calendar, UserCheck, Activity, Layers, ShieldAlert, QrCode } from "lucide-react";
import { StatCard } from "../../components/common/CommonUI";
import { QRCodeSVG } from "qrcode.react";

export function BusinessPresenterDashboard({
  activeTab,
  setActiveTab,
  liveSessionId,
  setLiveSessionId,
  currentSlide,
  handlePrevSlide,
  handleNextSlide,
  triggerReaction,
  askQuestion
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
  liveSessionId: string | null;
  setLiveSessionId: (s: string | null) => void;
  currentSlide: number;
  handlePrevSlide: () => void;
  handleNextSlide: () => void;
  triggerReaction: (e: string) => void;
  askQuestion: (t: string, a: boolean, n: string) => void;
}) {
  const meetingId = liveSessionId === "SESS-102" ? "847-192-302" : "983-294-811";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://meetpulse.live";
  const joinUrl = `${origin}/join?meetingId=${meetingId}`;

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Meetings" value="2 Scheduled" change="Next at 11 AM" icon={Calendar} gradient="from-indigo-500 to-purple-500" />
          <StatCard label="Average Attendance" value="92%" change="Optimal" icon={UserCheck} gradient="from-purple-500 to-pink-500" />
          <StatCard label="Average Engagement" value="84%" change="Stable" icon={Activity} gradient="from-cyan-500 to-blue-500" />
          <StatCard label="Recent Presentations" value="6 Slides" change="Updated" icon={Layers} gradient="from-rose-500 to-orange-500" />
        </div>

        <div className="bg-gradient-to-br from-indigo-950/40 to-[#111827] border border-indigo-500/20 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base">Corporate Boardroom Panel</h3>
            <p className="text-xs text-slate-400 mt-1">Simulate corporate presentations, live task tracking, and AI minutes creation.</p>
          </div>
          <button onClick={() => {
            setLiveSessionId("MEET-99");
            alert("Corporate Boardroom is now active!");
            setActiveTab("live");
          }} className="mt-4 bg-primary text-white hover:opacity-90 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm w-fit cursor-pointer">
            Start Live Meeting Boardroom
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === "create-session") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6 max-w-md mx-auto">
        <h3 className="font-bold text-sm">Create Corporate Boardroom</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground block mb-1">MEETING NAME</label>
            <input placeholder="Q1 Strategy & Retrospective" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground block mb-1">SLIDE DECK FILE</label>
            <input type="file" className="w-full text-xs" />
          </div>
          <button onClick={() => {
            setLiveSessionId("MEET-99");
            alert("Meeting published and live QR generated!");
            setActiveTab("live");
          }} className="w-full bg-primary text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer">Publish Meeting</button>
        </div>
      </div>
    );
  }

  if (activeTab === "live") {
    return (
      <div className="space-y-6">
        {!liveSessionId ? (
          <div className="text-center py-20 bg-card border border-border rounded-3xl space-y-4">
            <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm">No Active Live Boardroom</h4>
            <button onClick={() => setLiveSessionId("MEET-99")} className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Start Boardroom</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950 aspect-video rounded-3xl border border-border p-6 flex flex-col justify-between relative">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Q1 Strategy Boardroom</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded">LIVE PRESENTATION</span>
                </div>
                
                <div className="my-auto text-center space-y-2">
                  <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-widest">Slide {currentSlide + 1} of 10</span>
                  <h2 className="text-xl font-bold text-white">Q1 Sprint Retrospective Summary</h2>
                  <p className="text-xs text-slate-400">Team velocity improvements and deployment metrics.</p>
                </div>

                <div className="flex justify-center gap-2">
                  <button onClick={handlePrevSlide} className="bg-white/5 border border-border p-2 rounded-xl text-xs cursor-pointer">Prev</button>
                  <button onClick={handleNextSlide} className="bg-white/5 border border-border p-2 rounded-xl text-xs cursor-pointer">Next</button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-4 flex gap-2">
                <button onClick={() => alert("Minutes captured successfully by AI summary engine.")} className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Create AI Minutes</button>
                <button onClick={() => setLiveSessionId(null)} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Conclude Meeting</button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary text-center">Meeting QR Scanner Code</h4>
              <div className="mx-auto bg-white p-3 rounded-xl w-32 h-32 flex items-center justify-center border border-border">
                <QRCodeSVG value={joinUrl} size={104} />
              </div>
              <div className="p-3 bg-muted/10 border border-border rounded-xl text-xs space-y-2">
                <p className="font-semibold text-center">Employee Attendance Score Metrics</p>
                <p className="text-[10px] text-muted-foreground text-center">Score dynamically logs joining times, slide activity & poll answers.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "reports") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-sm">AI Minutes & Summary Reports</h3>
        <div className="p-4 bg-muted/10 border border-border rounded-2xl space-y-3 text-xs leading-relaxed">
          <p className="font-bold">Meeting Summary: Q1 Retrospective</p>
          <p>The team adopted trunk-based development to streamline release cycles. Database migrations are bottlenecked; Alex Thompson was assigned task to optimize index files. Total engagement averaged 84%.</p>
          <button onClick={() => alert("PDF exported successfully.")} className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold cursor-pointer">Export PDF Reports</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-3xl space-y-3">
      <p className="font-bold text-foreground">Welcome to Corporate Boardroom Workspace</p>
      <p>Select a tab from the sidebar to begin.</p>
    </div>
  );
}
