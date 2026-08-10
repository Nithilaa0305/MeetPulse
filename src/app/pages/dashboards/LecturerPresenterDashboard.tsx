import React, { useState } from "react";
import { motion } from "motion/react";
import {
  UserCheck, Activity, Brain, Users, Radio, Play, Bell, ChevronLeft, ChevronRight,
  QrCode, ThumbsUp, ShieldAlert, Plus, Edit2, Trash2, AlertTriangle, X, Star
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { StatCard } from "../../components/common/CommonUI";
import { Session, LiveQuestion, LivePoll } from "../../types";
import { LiveTranscriptionPanel } from "../../components/ui/LiveTranscriptionPanel";
import { QRCodeSVG } from "qrcode.react";
import { DocxRenderer } from "../../components/ui/DocxRenderer";
import { PptxRenderer } from "../../components/ui/PptxRenderer";
import { parsePptxText } from "../../utils/pptxParser";
import { generateQuizFromTranscript, groupSimilarQuestions } from "../../utils/llmService";
import { supabase } from "../../../lib/supabase";
import { useMeetingStore } from "../../../store/useMeetingStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { useDataStore } from "../../../store/useDataStore";
import { socket, connectSocket, disconnectSocket } from "../../../lib/socket";
import * as pdfjsLib from "pdfjs-dist";

// Disable worker to avoid Vite bundling and CORS issues; fallback to main thread parsing
// pdfjsLib.GlobalWorkerOptions.workerSrc = '';

async function parsePdfText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  } catch (error) {
    console.error("PDF Parsing failed:", error);
    return "";
  }
}

async function uploadToSupabaseStorage(file: File): Promise<string> {
  const bucketName = "Materials";
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  
  let mimeType = file.type;
  if (!mimeType) {
    if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
    else if (file.name.toLowerCase().endsWith('.pptx')) mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    else mimeType = 'application/octet-stream';
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: mimeType
    });
    
  if (error) {
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);
    
  return publicUrl;
}

export function LecturerPresenterDashboard({
  activeTab,
  setActiveTab,
  sessions,
  confusionAlerts,
  activeAlerts,
  removeAlert,
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
  setActiveDocumentName,
  quizStats
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
  livePoll: LivePoll | null;
  setLivePoll: (poll: LivePoll | null) => void;
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
  quizStats: Record<string, { correct: number; incorrect: number; question: string }>;
  confusionAlerts: any[];
  activeAlerts: { id: string; type: string; studentName: string; timestamp: Date }[];
  removeAlert: (id: string) => void;
}) {
  const [allowGuest, setAllowGuest] = useState(true);
  const user = useAuthStore(state => state.user);
  const allCourses = useDataStore(state => state.courses);
  const myCourses = allCourses.filter(c => c.lecturer_id === user?.id || c.lecturer === user?.name);
  const [slideFile, setSlideFile] = useState<string>("");
  const [slideTitlesText, setSlideTitlesText] = useState<string>("");
  const [uploadedMaterials, setUploadedMaterials] = useState<{ name: string; size: string; type: string; url?: string; localUrl?: string; fileObject?: File; textContents?: string; slidesText?: string[][] }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGroupingQuestions, setIsGroupingQuestions] = useState(false);
  
  const audienceCount = useMeetingStore(state => state.audienceCount);

  const handleConcludeMeeting = async () => {
    if (!liveSessionId) return;
    
    // Compute analytics
    const analyticsData = {
      audienceCount,
      pulseScore,
      speakingPace,
      quizStats,
      liveQuestions,
      liveReactions,
      livePoll: livePoll || null
    };

    try {
      const { supabase } = await import('../../../lib/supabase');
      await supabase.from('meetings').update({
        status: 'ended',
        analytics: analyticsData
      }).eq('id', liveSessionId);

      setLiveSessionId(null);
      setActiveTab("overview");
      alert("Session concluded and analytics saved to the database.");
    } catch (err) {
      console.error(err);
      alert("Failed to save analytics.");
    }
  };

  // Automatic Debounced AI Grouping for Questions
  React.useEffect(() => {
    if (activeTab !== "overview" || liveQuestions.length < 2 || isGroupingQuestions) return;

    // Check if any grouping is needed (if there are new non-grouped questions)
    // We assume grouped questions might have a count > 1 or specific id format.
    // To prevent infinite loops, we'll only group if the length of liveQuestions changed recently and hasn't been grouped yet.
    // A simple debounce:
    const timer = setTimeout(async () => {
      setIsGroupingQuestions(true);
      try {
        const grouped = await groupSimilarQuestions(liveQuestions);
        // Only update if it actually reduced the number of questions to avoid useless renders
        if (grouped.length !== liveQuestions.length || JSON.stringify(grouped) !== JSON.stringify(liveQuestions)) {
          useMeetingStore.getState().setLiveQuestions(grouped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsGroupingQuestions(false);
      }
    }, 5000); // 5 seconds debounce

    return () => clearTimeout(timer);
  }, [liveQuestions, activeTab, isGroupingQuestions]);

  // Edit/Delete Session State & Handlers
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editName, setEditName] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editAllowGuest, setEditAllowGuest] = useState(true);

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
    } catch (err: any) {
      console.warn("Could not delete from cloud database, deleting locally:", err);
      if (err.code === '42501') {
        alert("Failed to delete session from cloud database due to Row-Level Security (RLS) policies. To enable database deletes, run this command in your Supabase SQL editor:\n\nCREATE POLICY \"Enable delete for authenticated users\" ON meetings FOR DELETE USING (true);");
      }
    }

    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      try {
        localStorage.setItem('meetpulse_local_sessions', JSON.stringify(updated));
      } catch (e) {
        console.error("Local storage delete save failed", e);
      }
      return updated;
    });

    if (liveSessionId === sessionId) {
      setLiveSessionId(null);
    }
  };

  const handleStartEdit = (s: Session) => {
    setEditingSession(s);
    setEditName(s.name);
    setEditCourse(s.course);
    setEditSubject(s.subject);
    setEditPlatform(s.platform);
    setEditLink(s.link);
    setEditAllowGuest(s.allowGuest ?? true);
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;

    const updatedSess: Session = {
      ...editingSession,
      name: editName,
      course: editCourse,
      subject: editSubject,
      platform: editPlatform,
      link: editLink,
      allowGuest: editAllowGuest
    };

    // Update DB
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          title: editName,
          platform: editPlatform,
          // course and subject can be updated if the column exists
          // schema.sql has: title, description, platform, status
          // we can also pass course and subject if they are added
        })
        .eq('id', editingSession.id);
      if (error) throw error;
    } catch (err: any) {
      console.warn("Could not update session in cloud database, saving locally:", err);
      if (err.code === '42501') {
        alert("Failed to save changes to cloud database due to Row-Level Security (RLS) policies. To enable database updates, run this command in your Supabase SQL editor:\n\nCREATE POLICY \"Enable update for authenticated users\" ON meetings FOR UPDATE USING (true);");
      }
    }

    // Update state and localstorage
    setSessions(prev => {
      const updated = prev.map(s => s.id === editingSession.id ? updatedSess : s);
      try {
        localStorage.setItem('meetpulse_local_sessions', JSON.stringify(updated));
      } catch (e) {
        console.error("Local storage edit save failed", e);
      }
      return updated;
    });

    setEditingSession(null);
  };
  const currentSession = sessions.find(s => s.id === liveSessionId) || sessions[0];
  const activeMaterial = currentSession?.materials?.find(m => m.name === activeDocumentName) || currentSession?.materials?.[0];
  const meetingId = currentSession?.meetingId || "983-294-811";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://meetpulse.live";
  const joinUrl = `${origin}/join?meetingId=${meetingId}`;

  if (activeTab === "overview") {
    return (
      <>
        <div className="space-y-6 relative">
          {/* Alerts Toasts */}
          <div className="absolute top-0 right-0 z-50 flex flex-col gap-2 pointer-events-none">
          {activeAlerts.map(alert => (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              key={alert.id} 
              className="pointer-events-auto bg-amber-500/10 border border-amber-500 text-amber-500 px-4 py-3 rounded-2xl shadow-lg flex items-start gap-3 w-80 backdrop-blur-md"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm">Alert: {alert.type}</p>
                <p className="text-[10px] opacity-80">Reported by {alert.studentName}</p>
              </div>
              <button onClick={() => removeAlert(alert.id)} className="text-amber-500 hover:text-amber-400">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Average Attendance" value="94.8%" change="↑ 1.2% this week" icon={UserCheck} gradient="from-indigo-500 to-purple-500" />
          <StatCard label="Average Engagement" value="88.2%" change="Optimal" icon={Activity} gradient="from-purple-500 to-pink-500" />
          <StatCard label="Average Understanding" value="84%" change="Stable" icon={Brain} gradient="from-cyan-500 to-blue-500" />
          <StatCard label="Students Waiting" value="0 Waiting" change="Empty lobby" icon={Users} gradient="from-rose-500 to-orange-500" />
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
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setLiveSessionId(s.id);
                      setAudienceCount(30);
                      setActiveTab("live");
                    }}
                    className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1">
                    <Play className="w-3 h-3" /> Launch
                  </button>
                  <button 
                    onClick={() => handleStartEdit(s)}
                    className="text-slate-400 hover:text-indigo-400 font-medium cursor-pointer flex items-center gap-1"
                    title="Edit Session"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteSession(s.id)}
                    className="text-slate-400 hover:text-red-400 font-medium cursor-pointer flex items-center gap-1"
                    title="Delete Session"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl relative text-left">
            <div>
              <h3 className="font-bold text-sm text-foreground">Edit Session Details</h3>
              <p className="text-xs text-muted-foreground">Modify details for this scheduled session.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block">SESSION NAME</label>
                <input 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-foreground" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">COURSE</label>
                  <select value={editCourse} onChange={e => setEditCourse(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2.5 text-xs outline-none text-foreground">
                    {myCourses.length === 0 && <option value="">No courses assigned</option>}
                    {myCourses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">SUBJECT / TOPIC</label>
                  <input value={editSubject} onChange={e => setEditSubject(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none text-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">MEETING PLATFORM</label>
                  <select value={editPlatform} onChange={e => setEditPlatform(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2.5 text-xs outline-none text-foreground">
                    <option value="MeetPulse Live">MeetPulse Live</option>
                    <option value="Zoom">Zoom Meeting</option>
                    <option value="Google Meet">Google Meet</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">MEETING LINK (OPTIONAL)</label>
                  <input value={editLink} onChange={e => setEditLink(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none text-foreground" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block">PARTICIPANT ACCESS MODE</label>
                <select 
                  value={editAllowGuest ? "guest" : "login"} 
                  onChange={e => setEditAllowGuest(e.target.value === "guest")} 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2.5 text-xs outline-none text-foreground"
                >
                  <option value="guest">Guest Access Allowed (Scan QR / Join instantly)</option>
                  <option value="login">Strict Login Required (Credentials required)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button 
                onClick={() => setEditingSession(null)}
                className="text-slate-300 border border-slate-700 hover:bg-slate-800 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="bg-primary text-white hover:opacity-90 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
                {myCourses.length === 0 && <option value="">No courses assigned</option>}
                {myCourses.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
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
                      
                      // Parse PDF text locally using pdfjs-dist
                      if (ext === "PDF") {
                        parsePdfText(file).then(text => {
                          setUploadedMaterials(prev => prev.map(m => m.name === file.name ? { ...m, textContents: text } : m));
                          const currentText = useMeetingStore.getState().globalMaterialText;
                          useMeetingStore.getState().setGlobalMaterialText(currentText + "\n\n--- Document: " + file.name + " ---\n\n" + text);
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

          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={isUploading}
              onClick={async () => {
                const parsedSlides = slideTitlesText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
                const tempId = "SESS-" + (100 + sessions.length + 1);
                const newSess: Session = {
                  id: tempId,
                  name: newSessionName || "Custom Lecture Topic",
                  description: "Simulated presentation session.",
                  course: newSessionCourse,
                  subject: newSessionSubject,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  platform: newSessionPlatform,
                  link: newSessionLink || "https://meetpulse.live/join",
                  slidesCount: parsedSlides.length > 0 ? parsedSlides.length : 12,
                  meetingId: (Math.floor(100 + Math.random() * 900)) + "-" + (Math.floor(100 + Math.random() * 900)) + "-" + (Math.floor(100 + Math.random() * 900)),
                  allowGuest: allowGuest,
                  slides: parsedSlides.length > 0 ? parsedSlides : undefined,
                  presentationFile: slideFile || undefined,
                  materials: uploadedMaterials.length > 0 ? uploadedMaterials : undefined
                };

                // Connect to database
                try {
                  const user = useAuthStore.getState().user;
                  const insertData: any = {
                    title: newSess.name,
                    description: newSess.description,
                    platform: newSess.platform,
                    status: 'scheduled',
                    materials: newSess.materials || []
                  };
                  if (user) {
                    insertData.presenter_id = user.id;
                  }
                  
                  const { data, error } = await supabase
                    .from('meetings')
                    .insert(insertData)
                    .select()
                    .single();

                  if (error) {
                    throw error;
                  }
                  
                  if (data) {
                    newSess.id = data.id;
                    newSess.meetingId = data.id.substring(0, 8); // Match student fetch logic
                  }
                  alert(`Session created & saved to database successfully!\n\nLaunch it from the dashboard overview whenever you are ready.`);
                } catch (dbErr: any) {
                  console.warn("Could not save to Supabase database, using local storage fallback:", dbErr);
                  if (dbErr.code === '42501') {
                    alert(`Saved to local state, but failed to save to cloud database due to Row-Level Security (RLS) policies on the 'meetings' table.\n\nTo enable database persistence, please run the SQL migration in your Supabase dashboard:\n\nCREATE POLICY "Enable insert for authenticated users" ON meetings FOR INSERT WITH CHECK (auth.uid() = presenter_id);`);
                  } else {
                    alert(`Saved to local state, but database save failed: ${dbErr.message || dbErr}.`);
                  }
                }

                setSessions(prev => {
                  const updated = [newSess, ...prev] as any;
                  // Persist to local storage as fallback
                  try {
                    localStorage.setItem('meetpulse_local_sessions', JSON.stringify(updated));
                  } catch (e) {
                    console.error("Local storage save failed", e);
                  }
                  return updated;
                });
                setActiveTab("overview");
              }}
              className="text-slate-300 border border-white/10 hover:bg-white/5 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center"
            >
              Create for Later
            </button>

            <button 
              disabled={isUploading}
              onClick={async () => {
                const parsedSlides = slideTitlesText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
                const tempId = "SESS-" + (100 + sessions.length + 1);
                const newSess: Session = {
                  id: tempId,
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

                // Connect to database
                try {
                  const user = useAuthStore.getState().user;
                  const insertData: any = {
                    title: newSess.name,
                    description: newSess.description,
                    platform: newSess.platform,
                    status: 'live',
                    materials: newSess.materials || []
                  };
                  if (user) {
                    insertData.presenter_id = user.id;
                  }
                  
                  const { data, error } = await supabase
                    .from('meetings')
                    .insert(insertData)
                    .select()
                    .single();

                  if (error) {
                    throw error;
                  }
                  
                  if (data) {
                    newSess.id = data.id;
                    newSess.meetingId = data.id.substring(0, 8); // Match student fetch logic
                  }
                  alert(`Session created & started on database successfully!`);
                } catch (dbErr: any) {
                  console.warn("Could not save live session to database, using local state:", dbErr);
                  if (dbErr.code === '42501') {
                    alert(`Launching session in local state, but database save failed due to Row-Level Security (RLS) policies on the 'meetings' table.\n\nTo persist it, please run the SQL migration in your Supabase dashboard:\n\nCREATE POLICY "Enable insert for authenticated users" ON meetings FOR INSERT WITH CHECK (auth.uid() = presenter_id);`);
                  } else {
                    alert(`Launching session, but database save failed: ${dbErr.message || dbErr}.`);
                  }
                }

                setSessions(prev => {
                  const updated = [newSess, ...prev] as any;
                  try {
                    localStorage.setItem('meetpulse_local_sessions', JSON.stringify(updated));
                  } catch (e) {
                    console.error("Local storage save failed", e);
                  }
                  return updated;
                });
                setLiveSessionId(newSess.id);
                setAudienceCount(50);
                setActiveTab("live");
              }}
              className={`text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center ${
                isUploading 
                  ? "bg-slate-700 cursor-not-allowed opacity-70 animate-pulse" 
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 cursor-pointer hover:shadow-lg"
              }`}
            >
              {isUploading ? "⚡ Uploading..." : "Create & Start Now"}
            </button>
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

                {/* Active Alerts Panel */}
                {activeAlerts.length > 0 && (
                  <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
                    {activeAlerts.map(alert => (
                      <div key={alert.id} className="bg-rose-500/90 border border-rose-400/50 p-3 rounded-xl shadow-xl flex items-center justify-between gap-4 backdrop-blur-sm min-w-[200px]">
                        <div>
                          <p className="text-[10px] text-rose-200 font-bold uppercase tracking-wider">{alert.studentName}</p>
                          <p className="text-sm text-white font-bold">{alert.type}</p>
                        </div>
                        <button 
                          onClick={() => removeAlert(alert.id)}
                          className="bg-black/20 hover:bg-black/40 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
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
                    <DocxRenderer url={activeMaterial.localUrl || activeMaterial.url} name={activeMaterial.name} />
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
                  <button onClick={() => {
                    const newPoll = livePoll?.isActive ? null : { question: "Quick Check", options: ["Yes", "No"], votes: [0, 0], isActive: true };
                    setLivePoll(newPoll as any);
                    if (newPoll) socket.emit("launch-poll", { sessionId: liveSessionId, ...newPoll });
                    else socket.emit("close-poll", { sessionId: liveSessionId });
                  }} className="bg-primary text-white hover:opacity-90 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    {livePoll?.isActive ? "End Poll" : "Launch Poll"}
                  </button>
                  <button onClick={() => socket.emit("pulse-check", { sessionId: liveSessionId })} className="bg-cyan-500 text-white hover:opacity-90 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    Pulse Check
                  </button>
                  <button 
                    disabled={isGeneratingQuiz}
                    onClick={async () => {
                      setIsGeneratingQuiz(true);
                      const transcript = useMeetingStore.getState().transcript;
                      const text = transcript.map(t => t.text).join(" ");
                      const courseName = currentSession?.name || "Lecture";
                      const questions = await generateQuizFromTranscript(courseName, text);
                      socket.emit("launch-quiz", { sessionId: liveSessionId, questions });
                      setIsGeneratingQuiz(false);
                      alert("Quiz launched and sent to all students!");
                    }} 
                    className={`text-white hover:opacity-90 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${isGeneratingQuiz ? 'bg-indigo-500/50 cursor-wait' : 'bg-indigo-500 cursor-pointer'}`}>
                    {isGeneratingQuiz ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</> : 'Generate AI Quiz'}
                  </button>
                  <button onClick={handleConcludeMeeting} className="bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">End Session</button>
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
                                // Update session materials
                                setSessions(prev => {
                                  const newSessions = prev.map(s => {
                                    if (s.id === currentSession.id) {
                                      return {
                                        ...s,
                                        materials: s.materials?.map(m => m.name === file.name ? { ...m, url: pubUrl } : m)
                                      };
                                    }
                                    return s;
                                  });
                                  
                                  const updatedSession = newSessions.find(s => s.id === currentSession.id);
                                  if (updatedSession && updatedSession.materials) {
                                    const dbMaterials = updatedSession.materials.map(m => {
                                      const copy = { ...m };
                                      if (copy.url && copy.url.startsWith('blob:')) copy.url = undefined;
                                      return copy;
                                    });
                                    supabase.from('meetings').update({ materials: dbMaterials }).eq('id', updatedSession.id).then(() => {
                                      if (liveSessionId) {
                                        socket.emit('materials-update', { sessionId: liveSessionId, materials: dbMaterials });
                                      }
                                    });
                                  }
                                  
                                  return newSessions as any;
                                });
                                setUploadError(null);
                              }).catch(err => {
                                console.error("Live Cloud upload failed:", err);
                                setUploadError(err.message || "Failed to upload to Supabase storage. Please check bucket configuration.");
                              });
                            }

                            // Parse PPTX text locally in browser using JSZip
                            if (ext === "PPTX" || ext === "PPT") {
                              parsePptxText(file).then(slides => {
                                setSessions(prev => {
                                  const newSessions = prev.map(s => {
                                    if (s.id === currentSession.id) {
                                      const newMaterials = s.materials?.map(m => m.name === file.name ? { ...m, slidesText: slides } : m) || [];
                                      const dbMaterials = newMaterials.map(m => {
                                        const copy = { ...m };
                                        if (copy.url && copy.url.startsWith('blob:')) copy.url = undefined;
                                        return copy;
                                      });
                                      supabase.from('meetings').update({ materials: dbMaterials }).eq('id', currentSession.id).then(() => {
                                        if (liveSessionId) socket.emit('materials-update', { sessionId: liveSessionId, materials: dbMaterials });
                                      });
                                      return {
                                        ...s,
                                        materials: newMaterials,
                                        slidesCount: slides.length > 0 ? slides.length : s.slidesCount
                                      };
                                    }
                                    return s;
                                  });
                                  return newSessions as any;
                                });
                              });
                            }
                            
                            // Parse PDF text locally using pdfjs-dist
                            if (ext === "PDF") {
                              parsePdfText(file).then(text => {
                                setSessions(prev => {
                                  const newSessions = prev.map(s => {
                                    if (s.id === currentSession.id) {
                                      const newMaterials = s.materials?.map(m => m.name === file.name ? { ...m, textContents: text } : m) || [];
                                      const dbMaterials = newMaterials.map(m => {
                                        const copy = { ...m };
                                        if (copy.url && copy.url.startsWith('blob:')) copy.url = undefined;
                                        return copy;
                                      });
                                      supabase.from('meetings').update({ materials: dbMaterials }).eq('id', currentSession.id).then(() => {
                                        if (liveSessionId) socket.emit('materials-update', { sessionId: liveSessionId, materials: dbMaterials });
                                      });
                                      return {
                                        ...s,
                                        materials: newMaterials
                                      };
                                    }
                                    return s;
                                  });
                                  return newSessions as any;
                                });
                              });
                            }
                            
                            if (ext === "TXT") {
                              file.text().then(text => {
                                setSessions(prev => {
                                  const newSessions = prev.map(s => {
                                    if (s.id === currentSession.id) {
                                      const newMaterials = s.materials?.map(m => m.name === file.name ? { ...m, textContents: text } : m) || [];
                                      const dbMaterials = newMaterials.map(m => {
                                        const copy = { ...m };
                                        if (copy.url && copy.url.startsWith('blob:')) copy.url = undefined;
                                        return copy;
                                      });
                                      supabase.from('meetings').update({ materials: dbMaterials }).eq('id', currentSession.id).then(() => {
                                        if (liveSessionId) socket.emit('materials-update', { sessionId: liveSessionId, materials: dbMaterials });
                                      });
                                      return {
                                        ...s,
                                        materials: newMaterials
                                      };
                                    }
                                    return s;
                                  });
                                  return newSessions as any;
                                });
                              });
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
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-[10px] text-muted-foreground">Audience Questions</p>
                    {isGroupingQuestions && <span className="text-[10px] text-indigo-400 animate-pulse">AI is summarizing...</span>}
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {liveQuestions.map(q => (
                      <div key={q.id} className="p-2.5 bg-background border border-border rounded-xl text-[10px] flex justify-between items-start">
                        <div>
                          <p className="text-foreground">{q.text}</p>
                          <span className="text-[8px] text-muted-foreground">By {q.author}</span>
                          {q.count && q.count > 1 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full font-bold text-[8px]">
                              {q.count} students asked this
                            </span>
                          )}
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
    // 1. Timeline Data for Engagement
    const timelineMap = new Map<string, { time: string, engagement: number, active: number }>();
    const addEvent = (timestamp: number, type: 'reaction' | 'question') => {
      const date = new Date(timestamp);
      const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      if (!timelineMap.has(timeString)) {
        timelineMap.set(timeString, { time: timeString, engagement: 0, active: 0 });
      }
      const bin = timelineMap.get(timeString)!;
      if (type === 'reaction') bin.engagement += 1;
      if (type === 'question') bin.active += 1;
    };

    liveReactions.forEach(r => addEvent(r.id, 'reaction'));
    liveQuestions.forEach(q => {
      const tsMatch = q.id.match(/^q-(\d+)$/);
      if (tsMatch) addEvent(parseInt(tsMatch[1]), 'question');
    });

    const timelineData = Array.from(timelineMap.values()).sort((a, b) => a.time.localeCompare(b.time));
    if (timelineData.length === 0) {
      const now = new Date();
      timelineData.push({ time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`, engagement: 0, active: 0 });
    }

    // 2. Understanding Metrics
    const answeredQuestions = liveQuestions.filter(q => q.isAnswered);
    const answerRate = liveQuestions.length ? Math.round((answeredQuestions.length / liveQuestions.length) * 100) : 0;
    
    const feedbackQuestions = answeredQuestions.filter(q => q.satisfaction);
    const satisfiedQuestions = feedbackQuestions.filter(q => q.satisfaction === 'yes');
    const satisfactionRate = feedbackQuestions.length ? Math.round((satisfiedQuestions.length / feedbackQuestions.length) * 100) : 0;

    const ratedQuestions = feedbackQuestions.filter(q => q.rating !== undefined);
    const averageRating = ratedQuestions.length 
      ? (ratedQuestions.reduce((acc, q) => acc + (q.rating || 0), 0) / ratedQuestions.length).toFixed(1)
      : '0.0';

    // 3. Attendance Metrics
    const uniqueParticipants = new Set(liveQuestions.map(q => q.author)).size;

    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
        <div>
          <h3 className="font-bold text-sm">Session Historical Analytics Center</h3>
          <p className="text-xs text-muted-foreground">Drill down across engagement rates, smart attendance, quizzes, polls and AI recommendations.</p>
        </div>

        <div className="border-b border-border flex flex-wrap gap-4 text-xs font-semibold">
          {["engagement", "attendance", "understanding", "polls", "quizzes", "questions", "ai"].map(tab => (
            <button 
              key={tab}
              onClick={() => setPresAnalyticsTab(tab)}
              className={`pb-2 px-1 capitalize cursor-pointer ${presAnalyticsTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>

        {presAnalyticsTab === "quizzes" && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-primary tracking-wider">AI Quiz Results</h4>
            {Object.keys(quizStats).length === 0 ? (
              <p className="text-xs text-muted-foreground">No quiz data available yet. Launch a quiz to see results.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(quizStats).map(([id, stat]) => {
                  const total = stat.correct + stat.incorrect;
                  const correctPct = total === 0 ? 0 : Math.round((stat.correct / total) * 100);
                  return (
                    <div key={id} className="bg-background border border-border p-4 rounded-2xl space-y-3">
                      <p className="font-bold text-sm text-foreground">{stat.question}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Correct: {stat.correct}</span>
                            <span>{correctPct}%</span>
                          </div>
                          <div className="w-full h-2 bg-rose-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${correctPct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {presAnalyticsTab === "questions" && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Question Feedback</h4>
            {liveQuestions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No questions have been asked yet.</p>
            ) : (
              <div className="space-y-3">
                {liveQuestions.map(q => (
                  <div key={q.id} className="bg-background border border-border p-4 rounded-2xl flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-foreground">{q.text}</p>
                      <p className="text-[10px] text-muted-foreground">Asked by: {q.author}</p>
                    </div>
                    {q.isAnswered ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          q.satisfaction === 'yes' ? 'bg-emerald-500/20 text-emerald-400' :
                          q.satisfaction === 'no' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {q.satisfaction === 'yes' ? 'Satisfied' : q.satisfaction === 'no' ? 'Unsatisfied' : 'Awaiting Feedback'}
                        </div>
                        {q.rating && (
                          <div className="flex items-center text-amber-400 gap-0.5">
                            {Array.from({length: q.rating}).map((_, i) => (
                              <Star key={i} size={10} fill="currentColor" />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        Unanswered
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {presAnalyticsTab === "engagement" && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Engagement Timeline</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="engagement" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} name="Reactions" />
                  <Area type="monotone" dataKey="active" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Questions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {presAnalyticsTab === "understanding" && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Understanding Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background border border-border p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Answer Rate</p>
                <p className="text-3xl font-bold text-primary">{answerRate}%</p>
                <p className="text-[10px] text-muted-foreground">{answeredQuestions.length} of {liveQuestions.length} answered</p>
              </div>
              <div className="bg-background border border-border p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Satisfaction Rate</p>
                <p className="text-3xl font-bold text-emerald-400">{satisfactionRate}%</p>
                <p className="text-[10px] text-muted-foreground">{satisfiedQuestions.length} positive feedback</p>
              </div>
              <div className="bg-background border border-border p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Average Rating</p>
                <p className="text-3xl font-bold text-amber-400">{averageRating}</p>
                <p className="text-[10px] text-muted-foreground">Out of 5.0 stars</p>
              </div>
            </div>
          </div>
        )}

        {presAnalyticsTab === "attendance" && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Attendance & Participation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background border border-border p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Audience</p>
                <p className="text-4xl font-bold text-primary">{audienceCount}</p>
                <p className="text-[10px] text-muted-foreground">Currently connected</p>
              </div>
              <div className="bg-background border border-border p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Unique Q&A Participants</p>
                <p className="text-4xl font-bold text-indigo-400">{uniqueParticipants}</p>
                <p className="text-[10px] text-muted-foreground">Students who asked questions</p>
              </div>
            </div>
          </div>
        )}

        {presAnalyticsTab === "polls" && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Live Poll Results</h4>
            {livePoll ? (
              <div className="bg-background border border-border p-4 rounded-2xl space-y-4">
                <p className="font-bold text-sm text-foreground">{livePoll.question}</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={livePoll.options.map((opt, i) => ({ name: opt, votes: livePoll.votes[i] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{fontSize: 10}} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="votes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No active poll data.</p>
            )}
          </div>
        )}

        {presAnalyticsTab === "ai" && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-primary tracking-wider">AI Insights</h4>
            <div className="bg-background border border-border p-4 rounded-2xl space-y-2">
              <p className="text-xs text-foreground">AI agent is monitoring your session pace and audience understanding.</p>
              <div className="p-3 bg-muted/10 border border-border rounded-xl">
                <p className="text-[10px] text-muted-foreground">Current Speaking Pace</p>
                <p className={`text-base font-bold ${speakingPace > 130 ? "text-rose-400" : "text-emerald-400"}`}>{speakingPace} WPM</p>
              </div>
            </div>
          </div>
        )}
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
