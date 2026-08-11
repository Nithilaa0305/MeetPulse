import React from "react";
import { motion } from "motion/react";
import { Play, Check, QrCode, ShieldAlert, ThumbsUp, Brain, Download, AlertTriangle, Star } from "lucide-react";
import { Session, LiveQuestion, LivePoll, QuizQuestion } from "../../types";
import { useAuthStore } from "../../../store/useAuthStore";
import { useMeetingStore } from "../../../store/useMeetingStore";
import { useDataStore } from "../../../store/useDataStore";
import { LiveTranscriptionPanel } from "../../components/ui/LiveTranscriptionPanel";
import { DocxRenderer } from "../../components/ui/DocxRenderer";
import { PptxRenderer } from "../../components/ui/PptxRenderer";
import { AIChatPanel } from "../../components/ui/AIChatPanel";
import { socket } from "../../../lib/socket";

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
  liveQuestions,
  sessions,
  activeDocumentName,
  setActiveDocumentName,
  activeQuiz
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
  livePoll: LivePoll | null;
  submitVote: (i: number) => void;
  askQuestion: (t: string, a: boolean, n: string) => void;
  upvoteQuestion: (i: string) => void;
  liveQuestions: LiveQuestion[];
  sessions: Session[];
  activeDocumentName: string | null;
  setActiveDocumentName: (name: string | null) => void;
  activeQuiz?: QuizQuestion[];
}) {
  const user = useAuthStore((state) => state.user);
  const students = useDataStore((state) => state.students);
  const courses = useDataStore((state) => state.courses);
  const transcript = useMeetingStore((state) => state.transcript);

  const [aiSummary, setAiSummary] = React.useState<string[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState<string | null>(null);

  const fetchSummary = async () => {
    const transcriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join("\n");
    if (!transcriptText.trim()) {
      setSummaryError("No transcript content available yet. Please wait for the lecture to begin and record some transcription.");
      return;
    }
    
    setIsGeneratingSummary(true);
    setSummaryError(null);
    try {
      const { generateLectureSummary } = await import("../../utils/llmService");
      const result = await generateLectureSummary(currentSession?.name || "Lecture", transcriptText);
      setAiSummary(result);
    } catch (e: any) {
      console.error(e);
      setSummaryError(e.message || "Failed to generate AI summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "learning" && transcript.length > 0 && aiSummary.length === 0 && !isGeneratingSummary) {
      fetchSummary();
    }
  }, [activeTab]);

  const canJoinSession = (session: Session) => {
    if (!user) return false;
    const student = students.find(s => s.id === user.id);
    if (!student) return true; // fallback if student profile not found in store
    const course = courses.find(c => c.name === session.course);
    if (!course) return true; // fallback if course not found
    return course.year === student.year && course.semester === student.semester;
  };

  const userName = user?.name || "Student";
  const [joinCode, setJoinCode] = React.useState("");
  const currentSession = sessions.find(s => s.id === liveSessionId) || sessions[0];
  const activeSlideIndex = isSynced ? currentSlide : localSlide;
  const activeMaterial = currentSession?.materials?.find(m => m.name === activeDocumentName) || currentSession?.materials?.[0];

  const [showPulseCheck, setShowPulseCheck] = React.useState(false);
  const [currentQuiz, setCurrentQuiz] = React.useState<QuizQuestion | null>(null);
  
  const [satisfactionPrompt, setSatisfactionPrompt] = React.useState<{ id: string, text: string, step: 1 | 2 } | null>(null);
  const [answeredIds, setAnsweredIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const newAnsweredIds = new Set(answeredIds);
    let shouldPrompt = null;
    
    liveQuestions.forEach(q => {
      if (q.isAnswered && !answeredIds.has(q.id)) {
        newAnsweredIds.add(q.id);
        if (q.author === userName) {
          shouldPrompt = { id: q.id, text: q.text, step: 1 as const };
        }
      }
    });

    if (shouldPrompt) {
      setSatisfactionPrompt(shouldPrompt);
      setAnsweredIds(newAnsweredIds);
    } else if (newAnsweredIds.size !== answeredIds.size) {
      setAnsweredIds(newAnsweredIds);
    }
  }, [liveQuestions, answeredIds, userName]);

  React.useEffect(() => {
    const handlePulse = () => setShowPulseCheck(true);
    window.addEventListener('pulse-check-requested', handlePulse);
    return () => window.removeEventListener('pulse-check-requested', handlePulse);
  }, []);

  React.useEffect(() => {
    if (activeQuiz && activeQuiz.length > 0 && !currentQuiz) {
      // Pick a random quiz from the broadcast
      const randomIdx = Math.floor(Math.random() * activeQuiz.length);
      setCurrentQuiz(activeQuiz[randomIdx]);
    } else if (!activeQuiz || activeQuiz.length === 0) {
      setCurrentQuiz(null);
    }
  }, [activeQuiz]);

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-950/60 to-[#111827] border border-indigo-500/15 rounded-3xl p-6">
          <p className="text-xs text-indigo-400 font-semibold mb-1">Student Portal</p>
          <h2 className="text-2xl font-bold text-white">Welcome back, {userName}!</h2>
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
              {(() => {
                const student = students.find(s => s.id === user?.id);
                const myCourses = student
                  ? courses.filter(c => c.year === student.year && c.semester === student.semester)
                  : [];
                if (myCourses.length > 0) {
                  return myCourses.map(c => (
                    <div key={c.id} className="flex justify-between">
                      <span>{c.code ? `${c.code} ` : ""}{c.name}</span>
                      <span className="font-bold">{c.engagement || 80}%</span>
                    </div>
                  ));
                }
                return (
                  <p className="text-[10px] text-muted-foreground italic">
                    No courses registered for {student?.year || "your year"} and {student?.semester || "semester"}.
                  </p>
                );
              })()}
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
                  // Search for an active live session first
                  const liveSess = sessions.find(s => s.status === 'live' || s.time?.toLowerCase().includes('live'));
                  if (liveSess) {
                    if (canJoinSession(liveSess)) {
                      setLiveSessionId(liveSess.id);
                      alert(`QR Scanned! Joined live session: "${liveSess.name}"`);
                    } else {
                      alert("You are not authorized to join this session. It belongs to a different Year or Semester.");
                      return;
                    }
                  } else if (sessions.length > 0) {
                    if (canJoinSession(sessions[0])) {
                      setLiveSessionId(sessions[0].id);
                      alert(`QR Scanned! Joined session: "${sessions[0].name}"`);
                    } else {
                      alert("You are not authorized to join this session. It belongs to a different Year or Semester.");
                      return;
                    }
                  } else {
                    setLiveSessionId("SESS-101");
                    alert("QR Scanned! Logged in immediately. Attendance is starting.");
                  }
                  setActiveTab("live");
                }}
                className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                Simulate Camera Scan
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground mb-1 block">OR ENTER MEETING ID / SESSION ID</label>
          <div className="flex gap-2">
            <input 
              placeholder="e.g. 983-294-811 or SESS-101" 
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className="bg-input border border-border px-3 py-2 text-xs rounded-xl flex-1 outline-none text-center font-mono font-bold" 
            />
            <button 
              onClick={async () => {
                const code = joinCode.trim();
                if (!code) return;

                let found = sessions.find(s => s.meetingId === code || s.id === code || s.name.toLowerCase().includes(code.toLowerCase()));
                
                // If not found locally, fetch latest from DB
                if (!found) {
                  const { supabase } = await import('../../../lib/supabase');
                  const { data } = await supabase.from('meetings').select('*');
                  if (data) {
                    const match = data.find(m => m.meeting_id === code || m.id === code || m.id.substring(0, 8) === code || m.title.toLowerCase().includes(code.toLowerCase()));
                    if (match) {
                      await useDataStore.getState().fetchData(null);
                      found = useDataStore.getState().sessions.find((s: Session) => s.id === match.id);
                    }
                  }
                }

                if (found) {
                  if (canJoinSession(found)) {
                    setLiveSessionId(found.id);
                    alert(`Session "${found.name}" joined successfully!`);
                    setActiveTab("live");
                  } else {
                    alert("You are not authorized to join this session. It belongs to a different Year or Semester.");
                  }
                } else {
                  alert("Session code not found. Please double check the Meeting ID on the Presenter's screen.");
                }
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
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold bg-slate-900 border border-white/10 px-2.5 py-1 rounded-full inline-block ${isSynced ? "animate-pulse text-indigo-400" : "text-amber-400"}`}>
                      {isSynced ? "● SYNCHRONIZED" : "○ SELF-PACED VIEW"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      📂 {activeDocumentName || currentSession?.presentationFile || "Default Lecture Slides"}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsSynced(!isSynced);
                      if (!isSynced) setLocalSlide(currentSlide);
                    }}
                    className="text-[9px] bg-primary/20 hover:bg-primary/35 text-white border border-primary/30 px-2 py-0.5 rounded cursor-pointer">
                    {isSynced ? "Unlock Slides" : "Catch Up (Sync)"}
                  </button>
                </div>

                {activeMaterial?.url && activeMaterial.type === "PDF" ? (
                  <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5 relative z-10 flex-grow my-2 min-h-[300px]">
                    <iframe 
                      src={`${activeMaterial.url}#page=${activeSlideIndex + 1}&toolbar=0&navpanes=0&scrollbar=0`} 
                      className="w-full h-full min-h-[300px] border-none"
                      title={activeMaterial.name}
                    />
                  </div>
                ) : activeMaterial && (activeMaterial.type === "PPTX" || activeMaterial.type === "PPT") ? (
                  <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5 relative z-10 flex-grow my-2 min-h-[300px]">
                    <PptxRenderer 
                      name={activeMaterial.name} 
                      url={activeMaterial.url}
                      currentSlide={activeSlideIndex} 
                      slidesCount={currentSession?.slidesCount || 10} 
                      slidesText={activeMaterial.slidesText}
                      onSlideSelect={!isSynced ? (slideNum) => {
                        setLocalSlide(slideNum);
                      } : undefined}
                    />
                  </div>
                ) : activeMaterial && (activeMaterial.type === "DOCX" || activeMaterial.type === "DOC") && activeMaterial.url ? (
                  <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5 relative z-10 flex-grow my-2 min-h-[300px]">
                    <DocxRenderer url={activeMaterial.url} name={activeMaterial.name} />
                  </div>
                ) : activeMaterial && (activeMaterial.type === "DOCX" || activeMaterial.type === "DOC" || activeMaterial.type === "TXT") ? (
                  <div className="w-full h-full bg-white text-slate-950 rounded-2xl p-8 border border-slate-300 relative z-10 flex-grow my-2 flex flex-col justify-between overflow-y-auto min-h-[300px] shadow-inner">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-b border-slate-200 pb-2">
                      <span>Word Handout Viewer</span>
                      <span>Page {activeSlideIndex + 1} of {currentSession?.slidesCount || 5}</span>
                    </div>
                    <div className="my-6 space-y-4 text-left">
                      <h1 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
                        {activeMaterial.name.replace(/\.[^/.]+$/, "")}
                      </h1>
                      <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                        <h4 className="font-bold text-slate-900">Section {activeSlideIndex + 1}: Study Materials</h4>
                        <p>
                          This document serves as a shared reference handout for our lecture. Presenters and participants can scroll and reference these paragraphs.
                        </p>
                        <p>
                          Key equations, diagrams, and reference manuals are populated in this handbook. Please make sure to download a copy for offline revision.
                        </p>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-2 font-mono">MeetPulse Office Document Simulator</div>
                  </div>
                ) : (
                  <div className="my-auto text-center space-y-3">
                    <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-widest">
                      Slide {activeSlideIndex + 1} of {currentSession?.slidesCount || 12}
                    </span>
                    <h2 className="text-xl md:text-3xl font-extrabold text-white">
                      {currentSession?.slides ? (
                        currentSession.slides[activeSlideIndex] || `Slide ${activeSlideIndex + 1}: Presentation Topic`
                      ) : (
                        <>
                          {activeSlideIndex === 0 && "Slide 1: Introduction to Deep Networks"}
                          {activeSlideIndex === 1 && "Slide 2: Mathematical Neuron Model"}
                          {activeSlideIndex === 2 && "Slide 3: Sigmoid & ReLU Activation Functions"}
                          {activeSlideIndex === 3 && "Slide 4: Forward Propagation Calculus"}
                          {activeSlideIndex === 4 && "Slide 5: Neural Errors & Loss Optimization"}
                          {activeSlideIndex === 5 && "Slide 6: Backpropagation Principles & Chain Rule"}
                          {activeSlideIndex >= 6 && `Slide ${activeSlideIndex + 1}: Gradient Descent Optimization`}
                        </>
                      )}
                    </h2>
                  </div>
                )}

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
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground block">YOUR PRIVATE NOTES</label>
                    <button 
                      onClick={() => {
                        const blob = new Blob([privateNotes], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Private_Notes_${currentSession.name.replace(/\s+/g, '_')}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                  <textarea 
                    value={privateNotes} 
                    onChange={e => setPrivateNotes(e.target.value)} 
                    placeholder="Write private notes on Slide 6..." 
                    className="w-full bg-input border border-border p-3 rounded-xl text-xs outline-none h-20 resize-none focus:border-primary/50" 
                  />
                </div>
              </div>
              
              {/* Quick Alerts */}
              <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500"/> Quick Alerts</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      socket.emit("student-alert", { sessionId: liveSessionId, type: "Too Fast", studentName: userName });
                      alert("Alert sent to presenter!");
                    }}
                    className="bg-muted/20 border border-border hover:border-amber-500/50 p-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer text-left">
                    Going too fast
                  </button>
                  <button 
                    onClick={() => {
                      socket.emit("student-alert", { sessionId: liveSessionId, type: "Not Audible", studentName: userName });
                      alert("Alert sent to presenter!");
                    }}
                    className="bg-muted/20 border border-border hover:border-rose-500/50 p-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer text-left">
                    Not audible
                  </button>
                  <button 
                    onClick={() => {
                      socket.emit("student-alert", { sessionId: liveSessionId, type: "Need Example", studentName: userName });
                      alert("Alert sent to presenter!");
                    }}
                    className="bg-muted/20 border border-border hover:border-indigo-500/50 p-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer text-left">
                    Need an example
                  </button>
                </div>
              </div>

              <LiveTranscriptionPanel isReadOnly={true} />
            </div>

            <div className="space-y-4">
              {showPulseCheck && (
                <div className="bg-gradient-to-br from-cyan-950/40 to-background border border-cyan-500 rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                  <h4 className="font-bold text-xs uppercase text-cyan-400 tracking-wider">Pulse Check Request</h4>
                  <p className="font-bold text-sm text-white">Do you understand the current material?</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        socket.emit('submit-pulse', { sessionId: liveSessionId, pulseValue: 1 });
                        setShowPulseCheck(false);
                      }}
                      className="flex-1 bg-card border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 p-2.5 rounded-xl text-xs font-bold text-emerald-400 transition-colors cursor-pointer">
                      Yes!
                    </button>
                    <button 
                      onClick={() => {
                        socket.emit('submit-pulse', { sessionId: liveSessionId, pulseValue: 0 });
                        setShowPulseCheck(false);
                      }}
                      className="flex-1 bg-card border border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 p-2.5 rounded-xl text-xs font-bold text-amber-400 transition-colors cursor-pointer">
                      Kind of
                    </button>
                    <button 
                      onClick={() => {
                        socket.emit('submit-pulse', { sessionId: liveSessionId, pulseValue: -1 });
                        setShowPulseCheck(false);
                      }}
                      className="flex-1 bg-card border border-rose-500/30 hover:border-rose-500 hover:bg-rose-500/10 p-2.5 rounded-xl text-xs font-bold text-rose-400 transition-colors cursor-pointer">
                      No
                    </button>
                  </div>
                </div>
              )}

              {currentQuiz && (
                <div className="bg-gradient-to-br from-indigo-950/40 to-background border border-indigo-500 rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <h4 className="font-bold text-xs uppercase text-indigo-400 tracking-wider flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> AI Knowledge Quiz</h4>
                  <p className="font-bold text-sm text-white">{currentQuiz.question}</p>
                  <div className="space-y-2">
                    {currentQuiz.options.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          const isCorrect = i === currentQuiz.correctAnswer;
                          socket.emit('submit-quiz-answer', { 
                            sessionId: liveSessionId, 
                            questionId: currentQuiz.id, 
                            questionText: currentQuiz.question, 
                            isCorrect 
                          });
                          alert(isCorrect ? "Correct! +10 points to your class score." : "Incorrect. Check your study notes later!");
                          setCurrentQuiz(null); // hide after answering
                        }}
                        className="w-full text-left bg-card border border-border hover:border-indigo-500 hover:bg-indigo-500/10 p-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {livePoll?.isActive && (
                <div className="bg-gradient-to-br from-indigo-950/40 to-background border border-primary rounded-3xl p-5 space-y-3">
                  <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Active Poll Launched</h4>
                  <p className="font-bold text-xs">{livePoll?.question}</p>
                  <div className="space-y-2">
                    {livePoll?.options?.map((opt, i) => (
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

              {/* Session Handouts & Materials */}
              <div className="bg-card border border-border rounded-3xl p-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Session Handouts & Materials</h4>
                {currentSession?.materials && currentSession.materials.length > 0 ? (
                  <div className="space-y-2">
                    {currentSession.materials.map((mat, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-background border border-border rounded-xl">
                        <div className="truncate max-w-[150px]">
                          <p className="font-bold truncate text-foreground">{mat.name}</p>
                          <span className="text-[9px] text-muted-foreground">{mat.type} • {mat.size}</span>
                        </div>
                        <button 
                          onClick={() => alert(`Downloading ${mat.name}...`)}
                          className="text-primary font-bold hover:underline text-[10px] cursor-pointer"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic text-center py-2">
                    No handouts uploaded for this session.
                  </p>
                )}
              </div>

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
                          askQuestion(text, anon, userName);
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
                      <div className="flex justify-between items-center text-[8px] text-muted-foreground mt-1">
                        <div className="flex gap-2 items-center">
                          <span>Slide {q.slide} • By {q.author}</span>
                          {q.isAnswered && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              q.satisfaction === 'yes' ? 'bg-emerald-500/20 text-emerald-400' :
                              q.satisfaction === 'no' ? 'bg-rose-500/20 text-rose-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {q.satisfaction === 'yes' ? 'Satisfied' : q.satisfaction === 'no' ? 'Unsatisfied' : 'Answered'}
                            </span>
                          )}
                          {q.rating && (
                            <span className="flex items-center text-amber-400 gap-0.5 ml-1">
                              {Array.from({length: q.rating}).map((_, i) => (
                                <Star key={i} size={8} fill="currentColor" />
                              ))}
                            </span>
                          )}
                        </div>
                        <button onClick={() => upvoteQuestion(q.id)} className="text-primary hover:underline font-bold cursor-pointer">▲ Upvote ({q.votes})</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <AIChatPanel />
              
              {satisfactionPrompt && (
                <div className="fixed bottom-6 right-6 z-50 bg-card border border-primary/50 p-4 rounded-2xl shadow-xl shadow-primary/20 w-80 flex flex-col gap-3">
                  <p className="text-xs font-bold text-foreground">Your question was answered!</p>
                  <p className="text-[10px] text-muted-foreground italic truncate">"{satisfactionPrompt.text}"</p>
                  
                  {satisfactionPrompt.step === 1 ? (
                    <>
                      <p className="text-[11px]">Were you satisfied with the answer?</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            useMeetingStore.getState().updateQuestionSatisfaction(satisfactionPrompt.id, 'yes');
                            socket.emit('question-feedback', {
                              sessionId: liveSessionId,
                              questionId: satisfactionPrompt.id,
                              satisfaction: 'yes'
                            });
                            setSatisfactionPrompt({ ...satisfactionPrompt, step: 2 });
                          }}
                          className="flex-1 bg-emerald-500/20 text-emerald-400 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-500/30 cursor-pointer">
                          Yes
                        </button>
                        <button 
                          onClick={() => {
                            useMeetingStore.getState().updateQuestionSatisfaction(satisfactionPrompt.id, 'no');
                            socket.emit('question-feedback', {
                              sessionId: liveSessionId,
                              questionId: satisfactionPrompt.id,
                              satisfaction: 'no'
                            });
                            setSatisfactionPrompt({ ...satisfactionPrompt, step: 2 });
                          }}
                          className="flex-1 bg-rose-500/20 text-rose-400 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-500/30 cursor-pointer">
                          No
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px]">How would you rate the answer?</p>
                      <div className="flex justify-between px-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => {
                              useMeetingStore.getState().updateQuestionRating(satisfactionPrompt.id, star);
                              socket.emit('question-rating', {
                                sessionId: liveSessionId,
                                questionId: satisfactionPrompt.id,
                                rating: star
                              });
                              setSatisfactionPrompt(null);
                            }}
                            className="text-muted-foreground hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <Star size={20} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "learning") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">AI Learning Summary Hub</h3>
            <p className="text-xs text-muted-foreground">Textbook-style lecture notes generated from real-time classroom discussions.</p>
          </div>
          <button 
            onClick={fetchSummary}
            disabled={isGeneratingSummary || transcript.length === 0}
            className="bg-primary text-white hover:opacity-90 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            {isGeneratingSummary ? "Generating..." : "Generate / Refresh"}
          </button>
        </div>

        {summaryError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs p-3.5 rounded-xl text-center font-medium">
            {summaryError}
          </div>
        )}

        {isGeneratingSummary ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/10 border border-border rounded-2xl animate-pulse">
            Summarizing transcription transcripts via AI service... Please hold.
          </div>
        ) : aiSummary.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-950/20 to-transparent border border-indigo-500/10 rounded-2xl p-5">
              <p className="text-xs text-indigo-400 font-bold mb-1 uppercase tracking-wider">
                {currentSession?.name || "Current Session"}
              </p>
              <div className="text-xs text-foreground space-y-3.5 leading-relaxed mt-2">
                {aiSummary.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-muted-foreground bg-muted/10 border border-border rounded-2xl space-y-2">
            <p className="font-semibold text-foreground">No Summary Generated Yet</p>
            <p>Click "Generate / Refresh" above to produce a structured summary of the live classroom transcript.</p>
          </div>
        )}
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
