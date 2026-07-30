import React, { useState } from "react";
import { motion } from "motion/react";
import {
  UserCheck, Activity, Brain, Users, Radio, Play, Bell, ChevronLeft, ChevronRight,
  QrCode, ThumbsUp, ShieldAlert, Plus
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { StatCard } from "../../components/common/CommonUI";
import { Session, LiveQuestion, LivePoll } from "../../types";
import { LiveTranscriptionPanel } from "../../components/ui/LiveTranscriptionPanel";
import { QRCodeSVG } from "qrcode.react";
import { DocxRenderer } from "../../components/ui/DocxRenderer";
import { PptxRenderer } from "../../components/ui/PptxRenderer";
import { parsePptxText } from "../../utils/pptxParser";
import { supabase } from "../../../lib/supabase";
import { useMeetingStore } from "../../../store/useMeetingStore";

async function uploadToSupabaseStorage(file: File): Promise<string> {
  const bucketName = "materials";
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  
  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      throw error;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (err) {
    console.warn("Supabase upload failed, attempting fallback to tmpfiles.org...", err);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error("Fallback upload failed");
      const data = await res.json();
      // Transform tmpfiles.org/12345/file.ext to tmpfiles.org/dl/12345/file.ext for direct download
      return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    } catch (fallbackErr) {
      console.error("Fallback upload also failed:", fallbackErr);
      throw err; // Throw original Supabase error if fallback also fails
    }
  }
}

export function LecturerPresenterDashboard({
  activeTab,
  setActiveTab,
  sessions,
  liveSessionId,
  setLiveSessionId,
  currentSlide,
  handlePrevSlide,
  handleNextSlide,
  setAudienceCount,
  liveReactions,
  livePoll,
  setLivePoll,
  liveQuestions,
  markQuestionAnswered,
  pulseScore,
  setPulseScore,
  speakingPace,
  newSessionName,
  setNewSessionName,
  newSessionCourse,
  setNewSessionCourse,
  newSessionSubject,
  setNewSessionSubject,
  newSessionPlatform,
  setNewSessionPlatform,
  newSessionLink,
  setNewSessionLink,
  setSessions,
  presAnalyticsTab,
  setPresAnalyticsTab,
  activeDocumentName,
  setActiveDocumentName
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sessions: Session[];
  liveSessionId: string | null;
  setLiveSessionId: (id: string | null) => void;
  currentSlide: number;
  handlePrevSlide: () => void;
  handleNextSlide: () => void;
  setAudienceCount: (c: number) => void;
  liveReactions: { id: number; emoji: string }[];
  livePoll: LivePoll;
  setLivePoll: React.Dispatch<React.SetStateAction<LivePoll>>;
  liveQuestions: LiveQuestion[];
  markQuestionAnswered: (id: string) => void;
  pulseScore: number;
  setPulseScore: (s: number) => void;
  speakingPace: number;
  newSessionName: string;
  setNewSessionName: (s: string) => void;
  newSessionCourse: string;
  setNewSessionCourse: (s: string) => void;
  newSessionSubject: string;
  setNewSessionSubject: (s: string) => void;
  newSessionPlatform: string;
  setNewSessionPlatform: (s: string) => void;
  newSessionLink: string;
  setNewSessionLink: (s: string) => void;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  presAnalyticsTab: string;
  setPresAnalyticsTab: (t: string) => void;
  activeDocumentName: string | null;
  setActiveDocumentName: (name: string | null) => void;
}) {
  const [allowGuest, setAllowGuest] = useState(true);
  const [slideFile, setSlideFile] = useState<string>("");
  const [slideTitlesText, setSlideTitlesText] = useState<string>("");
  const [uploadedMaterials, setUploadedMaterials] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const currentSession = sessions.find(s => s.id === liveSessionId) || sessions[0];
  const activeMaterial = currentSession?.materials?.find(m => m.name === activeDocumentName) || currentSession?.materials?.[0];
  const meetingId = currentSession?.meetingId || "983-294-811";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://meetpulse.live";
  const joinUrl = `${origin}/join?meetingId=${meetingId}`;

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Average Attendance" value="94.8%" change="↑ 1.2% this week" icon={UserCheck} gradient="from-indigo-500 to-purple-500" />
          <StatCard label="Average Engagement" value="88.2%" change="Optimal" icon={Activity} gradient="from-purple-500 to-pink-500" />
          <StatCard label="Average Understanding" value="84%" change="Stable" icon={Brain} gradient="from-cyan-500 to-blue-500" />
          <StatCard label="Students Waiting" value="0 Waiting" change="Empty lobby" icon={Users} gradient="from-rose-500 to-orange-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950/40 to-[#111827] border border-indigo-500/20 rounded-3xl p-6 space-y-4">
            <div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-widest">Active Cockpit System</span>
              <h3 className="text-xl font-bold mt-2">Neural Networks & Deep Learning — CS401</h3>
              <p className="text-xs text-slate-400 mt-1">Ready to sync live slides, polls and capture reaction logs with students.</p>
            </div>

            <div className="flex gap-2">
              {liveSessionId ? (
                <button 
                  onClick={() => setActiveTab("live")}
                  className="bg-primary text-white hover:opacity-90 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer">
                  <Radio className="w-4 h-4" /> Open Presenter Screen
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setLiveSessionId("SESS-101");
                    setAudienceCount(47);
                    setActiveTab("live");
                  }}
                  className="bg-emerald-500 text-white hover:opacity-90 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer">
                  <Play className="w-4 h-4" /> Launch Session
                </button>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-primary" /> Notifications
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-muted/10 border border-border rounded-xl text-xs space-y-1">
                <p className="font-semibold">Slide 4 Confusion Spike</p>
                <p className="text-[10px] text-muted-foreground">3 students indicated difficulty on weights derivation.</p>
              </div>
              <div className="p-3 bg-muted/10 border border-border rounded-xl text-xs space-y-1">
                <p className="font-semibold">Quiz Results Ready</p>
                <p className="text-[10px] text-muted-foreground">CS401 quiz 2 parsed successfully by AI summary engine.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm">Schedule & Presentations</h3>
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="flex justify-between items-center text-xs p-4 bg-background border border-border rounded-xl">
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-muted-foreground text-[10px]">{s.date} at {s.time} • {s.platform}</p>
                </div>
                <button 
                  onClick={() => {
                    setLiveSessionId(s.id);
                    setAudienceCount(30);
                    setActiveTab("live");
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer">Launch</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "create-session") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6 max-w-xl mx-auto">
        <div>
          <h3 className="font-bold text-sm">Session Creation Wizard</h3>
          <p className="text-xs text-muted-foreground">Generate live synchronization link, QR codes and meeting IDs.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1 block">SESSION NAME</label>
            <input 
              value={newSessionName} 
              onChange={e => setNewSessionName(e.target.value)} 
              placeholder="e.g. Backpropagation Math & Chain Rule" 
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-xs outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">COURSE</label>
              <select value={newSessionCourse} onChange={e => setNewSessionCourse(e.target.value)} className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-xs outline-none">
                <option value="CS401 Deep Learning">CS401 Deep Learning</option>
                <option value="CS301 Operating Systems">CS301 Operating Systems</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">SUBJECT / TOPIC</label>
              <input value={newSessionSubject} onChange={e => setNewSessionSubject(e.target.value)} className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">MEETING PLATFORM</label>
              <select value={newSessionPlatform} onChange={e => setNewSessionPlatform(e.target.value)} className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-xs outline-none">
                <option value="MeetPulse Live">MeetPulse Live</option>
                <option value="Zoom">Zoom Meeting</option>
                <option value="Google Meet">Google Meet</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">MEETING LINK (OPTIONAL)</label>
              <input value={newSessionLink} onChange={e => setNewSessionLink(e.target.value)} placeholder="https://..." className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs outline-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1 block">PARTICIPANT ACCESS MODE</label>
            <select 
              value={allowGuest ? "guest" : "login"} 
              onChange={e => setAllowGuest(e.target.value === "guest")} 
              className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-xs outline-none"
            >
              <option value="guest">Guest Access Allowed (Scan QR / Join instantly)</option>
              <option value="login">Strict Login Required (Credentials required)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">UPLOAD PRESENTATION SLIDES & MATERIALS (.pdf, .pptx, .docx, .txt)</label>
              <input 
                type="file" 
                multiple
                accept=".pdf,.pptx,.docx,.doc,.txt"
                onChange={e => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const parsedMaterials: any[] = [];
                    let hasOfficeDoc = false;
                    setIsUploading(true);
                    let pendingUploads = 0;
                    
                    Array.from(files).forEach(file => {
                      const ext = file.name.split('.').pop()?.toUpperCase() || "DOC";
                      if (ext === "PPTX" || ext === "PPT" || ext === "DOCX" || ext === "DOC") {
                        hasOfficeDoc = true;
                      }
                      
                      const matItem: any = {
                        name: file.name,
                        url: URL.createObjectURL(file),
                        fileObject: file,
                        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                        type: ext,
                        textContents: "",
                        slidesText: []
                      };
                      
                      // Trigger background cloud upload
                      if (ext === "PPTX" || ext === "PPT" || ext === "DOCX" || ext === "DOC" || ext === "PDF") {
                        pendingUploads++;
                        uploadToSupabaseStorage(file).then(pubUrl => {
                          setUploadedMaterials(prev => prev.map(m => m.name === file.name ? { ...m, url: pubUrl } : m));
                          setUploadError(null);
                        }).catch(err => {
                          console.error("Cloud upload failed:", err);
                          setUploadError(err.message || "Failed to upload to Supabase storage. Please check bucket configuration.");
                        }).finally(() => {
                          pendingUploads--;
                          if (pendingUploads === 0) {
                            setIsUploading(false);
                          }
                        });
                      }

                      // Parse PPTX text locally in browser using JSZip
                      if (ext === "PPTX" || ext === "PPT") {
                        parsePptxText(file).then(slides => {
                          setUploadedMaterials(prev => prev.map(m => m.name === file.name ? { ...m, slidesText: slides } : m));
                        });
                      }
                      
                      if (ext === "TXT") {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          matItem.textContents = evt.target?.result as string;
                        };
                        reader.readAsText(file);
                      }
                      
                      parsedMaterials.push(matItem);
                    });
                    
                    setUploadedMaterials(parsedMaterials);
                    setSlideFile(files[0].name);
                    
                    if (pendingUploads === 0) {
                      setIsUploading(false);
                    }
                  }
                }} 
                className="w-full bg-input border border-border rounded-xl px-3 py-1.5 text-xs outline-none text-muted-foreground"
              />
              {uploadedMaterials.length > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Selected Files ({uploadedMaterials.length}):</span>
                  {uploadedMaterials.map((mat, i) => (
                    <div key={i} className="text-[10px] text-indigo-300 font-mono flex justify-between bg-white/5 p-1 px-2 rounded border border-white/5">
                      <span className="truncate max-w-[180px]">{mat.name}</span>
                      <span>{mat.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">SLIDE TITLES (OPTIONAL - ONE PER LINE)</label>
              <textarea 
                value={slideTitlesText} 
                onChange={e => setSlideTitlesText(e.target.value)} 
                placeholder="Slide 1: Intro&#10;Slide 2: Main Model&#10;Slide 3: Activation Details"
                className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs outline-none h-16 resize-none"
              />
            </div>
          </div>

          <button 
            disabled={isUploading}
            onClick={() => {
              const parsedSlides = slideTitlesText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
              const newSess: Session = {
                id: "SESS-" + (100 + sessions.length + 1),
                name: newSessionName || "Custom Lecture Topic",
                description: "Simulated presentation session.",
                course: newSessionCourse,
                subject: newSessionSubject,
                date: "Today",
                time: "Live Now",
                platform: newSessionPlatform,
                link: newSessionLink || "https://meetpulse.live/join",
                slidesCount: parsedSlides.length > 0 ? parsedSlides.length : 12,
                meetingId: (Math.floor(100 + Math.random() * 900)) + "-" + (Math.floor(100 + Math.random() * 900)) + "-" + (Math.floor(100 + Math.random() * 900)),
                allowGuest: allowGuest,
                slides: parsedSlides.length > 0 ? parsedSlides : undefined,
                presentationFile: slideFile || undefined,
                materials: uploadedMaterials.length > 0 ? uploadedMaterials : undefined
              };
              setSessions(prev => [newSess, ...prev] as any);
              setLiveSessionId(newSess.id);
              setAudienceCount(50);
              alert(`Session created successfully!\n\nMeeting ID: ${newSess.meetingId}\nQR generated instantly.`);
              setActiveTab("live");
            }}
            className={`w-full text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all ${
              isUploading 
                ? "bg-slate-700 cursor-not-allowed opacity-70 animate-pulse" 
                : "bg-gradient-to-r from-indigo-500 to-purple-600 cursor-pointer hover:shadow-lg"
            }`}
          >
            {isUploading ? "⚡ Uploading Materials to Presentation Server..." : "Publish & Start Session"}
          </button>
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
            <h4 className="font-bold text-sm">No Live Session Started</h4>
            <p className="text-xs text-muted-foreground">Start a session from the Home tab or Session wizard first.</p>
            <button onClick={() => {
              setLiveSessionId("SESS-101");
              setAudienceCount(42);
            }} className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">Start CS401 Default Session</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950 border border-border rounded-3xl overflow-hidden aspect-video flex flex-col justify-between p-6 relative">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-[10px] font-bold bg-slate-900 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    📂 {activeDocumentName || currentSession?.presentationFile || "Default Lecture Slides"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Recording live</span>
                  </div>
                </div>

                {uploadError && (
                  <div className="bg-rose-500/20 border border-rose-500/30 p-2.5 rounded-xl text-[10px] text-rose-300 flex items-start gap-2 mt-2 z-20">
                    <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Cloud Server Upload Failed:</p>
                      <p className="leading-relaxed">{uploadError}</p>
                      <p className="mt-1 text-slate-400">Slides will render as text outlines. To view diagrams and pictures, ensure your Supabase "materials" bucket exists and is public.</p>
                    </div>
                  </div>
                )}

                {activeMaterial?.url && activeMaterial.type === "PDF" ? (
                  <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5 relative z-10 flex-grow my-2 min-h-[300px]">
                    <iframe 
                      src={`${activeMaterial.url}#page=${currentSlide + 1}&toolbar=0&navpanes=0&scrollbar=0`} 
                      className="w-full h-full min-h-[300px] border-none"
                      title={activeMaterial.name}
                    />
                  </div>
                ) : activeMaterial && (activeMaterial.type === "PPTX" || activeMaterial.type === "PPT") ? (
                  <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5 relative z-10 flex-grow my-2 min-h-[300px]">
                    <PptxRenderer 
                      name={activeMaterial.name} 
                      url={activeMaterial.url}
                      fileObject={activeMaterial.fileObject}
                      currentSlide={currentSlide} 
                      slidesCount={currentSession?.slidesCount || 10} 
                      slidesText={activeMaterial.slidesText}
                      onSlideSelect={(slideNum) => {
                        useMeetingStore.getState().setCurrentSlide(slideNum);
                      }}
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
                      <span>Page {currentSlide + 1} of {currentSession?.slidesCount || 5}</span>
                    </div>
                    <div className="my-6 space-y-4 text-left">
                      <h1 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
                        {activeMaterial.name.replace(/\.[^/.]+$/, "")}
                      </h1>
                      <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                        <h4 className="font-bold text-slate-900">Section {currentSlide + 1}: Study Materials</h4>
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
                    <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-widest">Slide {currentSlide + 1} of {currentSession?.slidesCount || 12}</span>
                    <h2 className="text-xl md:text-3xl font-extrabold text-white">
                      {currentSession?.slides ? (
                        currentSession.slides[currentSlide] || `Slide ${currentSlide + 1}: Presentation Topic`
                      ) : (
                        <>
                          {currentSlide === 0 && "Slide 1: Introduction to Deep Networks"}
                          {currentSlide === 1 && "Slide 2: Mathematical Neuron Model"}
                          {currentSlide === 2 && "Slide 3: Sigmoid & ReLU Activation Functions"}
                          {currentSlide === 3 && "Slide 4: Forward Propagation Calculus"}
                          {currentSlide === 4 && "Slide 5: Neural Errors & Loss Optimization"}
                          {currentSlide === 5 && "Slide 6: Backpropagation Principles & Chain Rule"}
                          {currentSlide >= 6 && `Slide ${currentSlide + 1}: Gradient Descent Optimization`}
                        </>
                      )}
                    </h2>
                  </div>
                )}

                <div className="absolute bottom-16 right-6 flex flex-col gap-2 pointer-events-none h-44 justify-end overflow-hidden">
                  {liveReactions.map(r => (
                    <motion.div key={r.id} initial={{ y: 60, opacity: 1, scale: 0.5 }} animate={{ y: -120, opacity: 0, scale: 1.5 }} transition={{ duration: 1.5 }} className="text-2xl">
                      {r.emoji}
                    </motion.div>
                  ))}
                </div>

                <div className="bg-slate-900/90 border border-white/10 p-3 rounded-2xl text-[11px] text-slate-300">
                  <span className="font-bold text-indigo-400 block mb-1">Speaker Notes:</span>
                  <span>Explain how partial derivative with respect to W(ij) depends on output activation on layer i. Remind class of chain rule.</span>
                </div>
              </div>

              <div className="bg-card border border-border p-4 rounded-3xl flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <button onClick={handlePrevSlide} className="bg-white/5 border border-border hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button onClick={handleNextSlide} className="bg-white/5 border border-border hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Switch Presentation Material Dropdown */}
                  {currentSession?.materials && currentSession.materials.length > 0 && (
                    <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-4">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Presenting:</span>
                      <select 
                        value={activeDocumentName || currentSession.materials[0].name}
                        onChange={e => setActiveDocumentName(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-indigo-300 font-bold outline-none cursor-pointer"
                      >
                        {currentSession.materials.map((mat, i) => (
                          <option key={i} value={mat.name}>{mat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => alert("Meeting QR Code shared!")} className="bg-slate-900 border border-white/10 hover:border-primary text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">Share QR</button>
                  <button onClick={() => setLivePoll(prev => prev ? ({ ...prev, isActive: !prev.isActive }) : { question: "Quick Check", options: ["Yes", "No"], votes: [0, 0], isActive: true })} className="bg-primary text-white hover:opacity-90 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    {livePoll?.isActive ? "End Poll" : "Launch Poll"}
                  </button>
                  <button onClick={() => setPulseScore(Math.floor(70 + Math.random() * 30))} className="bg-cyan-500 text-white hover:opacity-90 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    Pulse Check
                  </button>
                  <button onClick={() => { setLiveSessionId(null); setActiveTab("overview"); }} className="bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">End Session</button>
                </div>
              </div>
              <LiveTranscriptionPanel />
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-3xl p-5 text-center space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Instant Join Scan</h4>
                <div className="mx-auto bg-white p-3 rounded-xl w-32 h-32 border border-border flex items-center justify-center">
                  <QRCodeSVG value={joinUrl} size={104} />
                </div>
                <p className="text-[11px] font-bold text-foreground mb-1">Meeting ID: {meetingId}</p>
                <div className="text-[10px] text-muted-foreground border-t border-border/50 pt-2 leading-relaxed">
                  <p className="font-semibold">Join from another laptop/device:</p>
                  <p className="font-mono text-indigo-300 font-bold mt-0.5 select-all">{origin.replace(/^https?:\/\//, "")}/join</p>
                </div>
              </div>

              {/* Session Handouts & Materials */}
              <div className="bg-card border border-border rounded-3xl p-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Session Materials</h4>
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

                {/* Upload Materials Live */}
                <div className="pt-2 border-t border-white/5">
                  <label className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-2 px-3 text-[11px] font-bold cursor-pointer transition-all active:scale-95">
                    <span>+ Add Material Live</span>
                    <input 
                      type="file" 
                      multiple
                      accept=".pdf,.pptx,.docx,.doc,.txt"
                      className="hidden"
                      onChange={e => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const parsedMaterials: any[] = [];
                          
                          Array.from(files).forEach(file => {
                            const ext = file.name.split('.').pop()?.toUpperCase() || "DOC";
                            const matItem: any = {
                              name: file.name,
                              url: URL.createObjectURL(file),
                              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                              type: ext,
                              textContents: "",
                              slidesText: []
                            };
                            
                            // Trigger background upload
                            if (ext === "PPTX" || ext === "PPT" || ext === "DOCX" || ext === "DOC" || ext === "PDF") {
                              uploadToSupabaseStorage(file).then(pubUrl => {
                                // Update session materials url in store
                                setSessions(prev => prev.map(s => {
                                  if (s.id === currentSession.id) {
                                    return {
                                      ...s,
                                      materials: s.materials?.map(m => m.name === file.name ? { ...m, url: pubUrl } : m)
                                    };
                                  }
                                  return s;
                                }) as any);
                                setUploadError(null);
                              }).catch(err => {
                                console.error("Live Cloud upload failed:", err);
                                setUploadError(err.message || "Failed to upload to Supabase storage. Please check bucket configuration.");
                              });
                            }

                            // Parse PPTX text locally in browser using JSZip
                            if (ext === "PPTX" || ext === "PPT") {
                              parsePptxText(file).then(slides => {
                                setSessions(prev => prev.map(s => {
                                  if (s.id === currentSession.id) {
                                    return {
                                      ...s,
                                      materials: s.materials?.map(m => m.name === file.name ? { ...m, slidesText: slides } : m),
                                      slidesCount: slides.length > 0 ? slides.length : s.slidesCount
                                    };
                                  }
                                  return s;
                                }) as any);
                              });
                            }
                            
                            if (ext === "TXT") {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                matItem.textContents = evt.target?.result as string;
                              };
                              reader.readAsText(file);
                            }
                            
                            parsedMaterials.push(matItem);
                          });
                          
                          setSessions(prev => prev.map(s => {
                            if (s.id === currentSession.id) {
                              const updatedMaterials = [...(s.materials || []), ...parsedMaterials];
                              return {
                                ...s,
                                materials: updatedMaterials,
                                slidesCount: s.slidesCount === 12 && updatedMaterials.length === 1 ? 10 : s.slidesCount
                              };
                            }
                            return s;
                          }) as any);
                          
                          setActiveDocumentName(parsedMaterials[0].name);
                          alert(`Uploading ${parsedMaterials.length} materials in background. Office files (PPTX, DOCX) will load in full fidelity shortly!`);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-sm">Classroom Health Diagnostics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/10 border border-border rounded-xl">
                    <p className="text-[10px] text-muted-foreground">Understanding Pulse</p>
                    <p className="text-base font-bold text-primary">{pulseScore}%</p>
                  </div>
                  <div className="p-3 bg-muted/10 border border-border rounded-xl">
                    <p className="text-[10px] text-muted-foreground">Pace Coach (WPM)</p>
                    <p className={`text-base font-bold ${speakingPace > 130 ? "text-rose-400" : "text-emerald-400"}`}>{speakingPace}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-[10px] text-muted-foreground">Audience Questions</p>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {liveQuestions.map(q => (
                      <div key={q.id} className="p-2.5 bg-background border border-border rounded-xl text-[10px] flex justify-between items-start">
                        <div>
                          <p className="text-foreground">{q.text}</p>
                          <span className="text-[8px] text-muted-foreground">By {q.author}</span>
                        </div>
                        {!q.isAnswered && (
                          <button onClick={() => markQuestionAnswered(q.id)} className="text-[8px] text-emerald-400 font-bold hover:underline cursor-pointer">Answered</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "analytics") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
        <div>
          <h3 className="font-bold text-sm">Session Historical Analytics Center</h3>
          <p className="text-xs text-muted-foreground">Drill down across engagement rates, smart attendance, quizzes, polls and AI recommendations.</p>
        </div>

        <div className="border-b border-border flex flex-wrap gap-4 text-xs font-semibold">
          {["engagement", "attendance", "understanding", "polls", "questions", "ai"].map(tab => (
            <button 
              key={tab}
              onClick={() => setPresAnalyticsTab(tab)}
              className={`pb-2 px-1 capitalize cursor-pointer ${presAnalyticsTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { time: "09:00", engagement: 65, active: 40 },
              { time: "09:15", engagement: 82, active: 78 },
              { time: "09:30", engagement: 91, active: 82 },
              { time: "09:45", engagement: 74, active: 80 },
              { time: "10:00", engagement: 88, active: 84 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="engagement" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} name="Engagement Score %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-3xl space-y-3">
      <p className="font-bold text-foreground">Welcome to Lecturer Cockpit Workspace</p>
      <p>Select a tab from the sidebar to begin.</p>
    </div>
  );
}
