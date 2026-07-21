import React from "react";
import { motion } from "motion/react";
import { Play, Check, QrCode, ShieldAlert, ThumbsUp } from "lucide-react";
import { Session, LiveQuestion, LivePoll } from "../../types";

export function StudentParticipantDashboard({
  activeTab,
  setActiveTab,
  liveSessionId,
  setLiveSessionId,
  hasScannedQR,
  setHasScannedQR,
  isSynced,
  setIsSynced,
  currentSlide,
  localSlide,
  setLocalSlide,
  triggerReaction,
  privateNotes,
  setPrivateNotes,
  livePoll,
  submitVote,
  askQuestion,
  upvoteQuestion,
  liveQuestions
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
  liveSessionId: string | null;
  setLiveSessionId: (s: string | null) => void;
  hasScannedQR: boolean;
  setHasScannedQR: (b: boolean) => void;
  isSynced: boolean;
  setIsSynced: (b: boolean) => void;
  currentSlide: number;
  localSlide: number;
  setLocalSlide: React.Dispatch<React.SetStateAction<number>>;
  triggerReaction: (e: string) => void;
  privateNotes: string;
  setPrivateNotes: (n: string) => void;
  livePoll: LivePoll;
  submitVote: (i: number) => void;
  askQuestion: (t: string, a: boolean, n: string) => void;
  upvoteQuestion: (i: string) => void;
  liveQuestions: LiveQuestion[];
}) {
  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-950/60 to-[#111827] border border-indigo-500/15 rounded-3xl p-6">
          <p className="text-xs text-indigo-400 font-semibold mb-1">Student Portal</p>
          <h2 className="text-2xl font-bold text-white">Welcome back, John Smith!</h2>
          <p className="text-xs text-slate-400 mt-1">CS401 Lecture is live now. Scan the QR code or click join below to synchronize.</p>
          <button 
            onClick={() => setActiveTab("join")}
            className="mt-4 bg-primary text-white hover:opacity-90 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer">
            <Play className="w-3.5 h-3.5" /> Join Live Classroom
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">Smart Attendance Score</h4>
              <div className="text-3xl font-extrabold text-foreground">94%</div>
              <p className="text-[10px] text-emerald-400 mt-1">↑ Above classroom average (85%)</p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-4">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: "94%" }} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-5">
            <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">Academic Learning Progress</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>CS401 Deep Learning</span>
                <span className="font-bold">68%</span>
              </div>
              <div className="flex justify-between">
                <span>CS301 Operating Systems</span>
                <span className="font-bold">82%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "join") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6 max-w-md mx-auto text-center">
        <div>
          <h3 className="font-bold text-sm">Join Lecture Room</h3>
          <p className="text-xs text-muted-foreground">Scan professor's QR code or enter Join Code below.</p>
        </div>

        <div className="bg-muted/30 border border-border rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-48">
          {hasScannedQR ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto"><Check className="w-6 h-6" /></div>
              <p className="text-xs font-bold text-emerald-400">QR Code Authenticated!</p>
              <p className="text-[10px] text-muted-foreground">Slides synchronizing in real time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <QrCode className="w-16 h-16 text-muted-foreground mx-auto animate-pulse" />
              <button 
                onClick={() => {
                  setHasScannedQR(true);
                  setLiveSessionId("SESS-101");
                  alert("QR Scanned! Logged in immediately. Attendance is starting.");
                  setActiveTab("live");
                }}
                className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                Simulate Camera Scan
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground mb-1 block">OR ENTER MEETING ID</label>
          <div className="flex gap-2">
            <input placeholder="e.g. 983-294-811" className="bg-input border border-border px-3 py-2 text-xs rounded-xl flex-1 outline-none text-center font-mono font-bold" />
            <button 
              onClick={() => {
                setLiveSessionId("SESS-101");
                alert("Session joined successfully!");
                setActiveTab("live");
              }}
              className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">Join</button>
          </div>
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
            <h4 className="font-bold text-sm">No Active Live Session</h4>
            <p className="text-xs text-muted-foreground">Enter code or scan QR code in the Join tab to start following a presentation.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950 border border-border rounded-3xl aspect-video flex flex-col justify-between p-6 relative">
                <div className="flex justify-between items-center text-slate-300">
                  <span className={`text-[10px] font-bold bg-slate-900 border border-white/10 px-2.5 py-1 rounded-full ${isSynced ? "animate-pulse text-indigo-400" : "text-amber-400"}`}>
                    {isSynced ? "● SYNCHRONIZED" : "○ SELF-PACED VIEW"}
                  </span>
                  <button 
                    onClick={() => {
                      setIsSynced(!isSynced);
                      if (!isSynced) setLocalSlide(currentSlide);
                    }}
                    className="text-[9px] bg-primary/20 hover:bg-primary/35 text-white border border-primary/30 px-2 py-0.5 rounded cursor-pointer">
                    {isSynced ? "Unlock Slides" : "Catch Up (Sync)"}
                  </button>
                </div>

                <div className="my-auto text-center space-y-3">
                  <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-widest">
                    Slide {(isSynced ? currentSlide : localSlide) + 1} of 12
                  </span>
                  <h2 className="text-xl md:text-3xl font-extrabold text-white">
                    {(isSynced ? currentSlide : localSlide) === 0 && "Slide 1: Introduction to Deep Networks"}
                    {(isSynced ? currentSlide : localSlide) === 1 && "Slide 2: Mathematical Neuron Model"}
                    {(isSynced ? currentSlide : localSlide) === 2 && "Slide 3: Sigmoid & ReLU Activation Functions"}
                    {(isSynced ? currentSlide : localSlide) === 3 && "Slide 4: Forward Propagation Calculus"}
                    {(isSynced ? currentSlide : localSlide) === 4 && "Slide 5: Neural Errors & Loss Optimization"}
                    {(isSynced ? currentSlide : localSlide) === 5 && "Slide 6: Backpropagation Principles & Chain Rule"}
                    {(isSynced ? currentSlide : localSlide) >= 6 && `Slide ${(isSynced ? currentSlide : localSlide) + 1}: Gradient Descent Optimization`}
                  </h2>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button 
                      disabled={isSynced || localSlide === 0} 
                      onClick={() => setLocalSlide(prev => Math.max(0, prev - 1))}
                      className="bg-slate-900 border border-white/10 hover:border-primary px-3 py-1 rounded text-xs disabled:opacity-30 cursor-pointer">
                      Prev
                    </button>
                    <button 
                      disabled={isSynced || localSlide === 11} 
                      onClick={() => setLocalSlide(prev => Math.min(11, prev + 1))}
                      className="bg-slate-900 border border-white/10 hover:border-primary px-3 py-1 rounded text-xs disabled:opacity-30 cursor-pointer">
                      Next
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    {["😊", "🚀", "👏", "😕"].map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => triggerReaction(emoji)}
                        className="w-8 h-8 bg-slate-900 border border-white/10 hover:border-primary rounded-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-sm cursor-pointer">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
                <h4 className="font-bold text-sm">Classroom Interaction Workbench</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground block">YOUR PRIVATE NOTES</label>
                  <textarea 
                    value={privateNotes} 
                    onChange={e => setPrivateNotes(e.target.value)} 
                    placeholder="Write private notes on Slide 6..." 
                    className="w-full bg-input border border-border p-3 rounded-xl text-xs outline-none h-20 resize-none focus:border-primary/50" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {livePoll.isActive && (
                <div className="bg-gradient-to-br from-indigo-950/40 to-background border border-primary rounded-3xl p-5 space-y-3">
                  <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Active Poll Launched</h4>
                  <p className="font-bold text-xs">{livePoll.question}</p>
                  <div className="space-y-2">
                    {livePoll.options.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          submitVote(i);
                          alert("Vote registered! Thank you for participating.");
                        }}
                        className="w-full text-left bg-card border border-border hover:border-primary/50 p-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Ask Professor a Question</h4>
                <div className="space-y-3">
                  <input id="stuQText" placeholder="Ask about backpropagation derivatives..." className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" id="stuAnon" className="rounded bg-input border-border" />
                      <span>Anonymous Mode</span>
                    </label>
                    <button 
                      onClick={() => {
                        const text = (document.getElementById("stuQText") as HTMLInputElement).value;
                        const anon = (document.getElementById("stuAnon") as HTMLInputElement).checked;
                        if (text) {
                          askQuestion(text, anon, "John Smith");
                          (document.getElementById("stuQText") as HTMLInputElement).value = "";
                          alert("Question sent instantly to presenter's dashboard!");
                        }
                      }}
                      className="bg-primary text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm cursor-pointer">
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-4 space-y-3">
                <p className="font-bold text-[10px] text-muted-foreground uppercase">Classroom Q&A Feed</p>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {liveQuestions.map(q => (
                    <div key={q.id} className="p-2.5 bg-background border border-border rounded-xl text-[10px] space-y-1">
                      <p className="text-foreground leading-snug">{q.text}</p>
                      <div className="flex justify-between items-center text-[8px] text-muted-foreground">
                        <span>Slide {q.slide} • By {q.author}</span>
                        <button onClick={() => upvoteQuestion(q.id)} className="text-primary hover:underline font-bold cursor-pointer">▲ Upvote ({q.votes})</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "learning") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-sm">AI Learning Summary Hub</h3>
        <div className="p-4 bg-muted/10 border border-border rounded-2xl space-y-2">
          <p className="font-bold text-xs text-indigo-400">CS401 Deep Learning - Neural Networks Fundamentals</p>
          <p className="text-xs text-foreground leading-relaxed">
            Focus of today's lecture was error optimization via Gradient Descent. The professor outlined the chain rule formulation where weights are adjusted proportional to the derivative of the loss function.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-3xl space-y-3">
      <p className="font-bold text-foreground">Welcome to Student Portal Workspace</p>
      <p>Select a tab from the sidebar to begin.</p>
    </div>
  );
}
