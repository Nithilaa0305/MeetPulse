import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Home, Building, Award, FileText, Users, BookOpen, BarChart2,
  Plus, Radio, QrCode, Brain, CheckSquare, Settings, LogOut, X, ShieldAlert, Search
} from "lucide-react";
import { OrgType, Role, Student, Lecturer, Course, Session, LiveQuestion, LivePoll, Employee } from "./types";
import { socket } from "../lib/socket";
import { CommandPalette } from "./components/CommandPalette";
import { SettingsPage } from "./pages/SettingsPage";
import { SuperAdminDashboard } from "./pages/dashboards/SuperAdminDashboard";
import { EducationAdminDashboard } from "./pages/dashboards/EducationAdminDashboard";
import { LecturerPresenterDashboard } from "./pages/dashboards/LecturerPresenterDashboard";
import { StudentParticipantDashboard } from "./pages/dashboards/StudentParticipantDashboard";
import { BusinessAdminDashboard } from "./pages/dashboards/BusinessAdminDashboard";
import { BusinessPresenterDashboard } from "./pages/dashboards/BusinessPresenterDashboard";
import { BusinessEmployeeDashboard } from "./pages/dashboards/BusinessEmployeeDashboard";
import { AnalyticsDashboard } from "./pages/analytics/AnalyticsDashboard";

import { useAuthStore } from "../store/useAuthStore";
import { useMeetingStore } from "../store/useMeetingStore";
import { useDataStore } from "../store/useDataStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

import { useSocketSync } from "../hooks/useSocketSync";

export function AppShell() {
  useSocketSync();
  const navigate = useNavigate();
  
  // Auth Store
  const { org, role, user, logout, updateUser } = useAuthStore();
  const currentUser = user || { name: "Guest", email: "" };
  const setCurrentUser = (updates: any) => updateUser(updates);
  const onLogout = async () => { await logout(); navigate('/'); };
  const onDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Make sure the delete_user RPC function is set up in Supabase.");
        return;
      }
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while deleting your account.");
    }
  };

  // Data Store
  const { 
    students, setStudents, lecturers, setLecturers, courses, setCourses, 
    employees, setEmployees, sessions, setSessions, fetchData 
  } = useDataStore();

  useEffect(() => {
    fetchData(null);
  }, [fetchData]);

  // Meeting Store
  const {
    liveSessionId, setLiveSessionId, currentSlide, setCurrentSlide, 
    audienceCount, setAudienceCount, liveQuestions, 
    liveReactions, triggerReaction, livePoll, setLivePoll,
    askQuestion, pulseScore, setPulseScore, speakingPace, 
    activityFeed, activeDocumentName, setActiveDocumentName, activeQuiz, quizStats,
    activeAlerts, removeAlert, markQuestionAnswered: storeMarkQuestionAnswered
  } = useMeetingStore();

  const submitVote = (idx: number) => {
    if (liveSessionId) {
      socket.emit('submit-poll-vote', { sessionId: liveSessionId, optionIndex: idx });
    }
  };
  const upvoteQuestion = (id: string) => {};
  const markQuestionAnswered = (id: string) => {
    storeMarkQuestionAnswered(id);
    if (liveSessionId) {
      socket.emit('mark-question-answered', { sessionId: liveSessionId, questionId: id });
    }
  };
  
  const [speakingPaceLocal, setSpeakingPaceLocal] = useState(speakingPace);
  const setSpeakingPace = setSpeakingPaceLocal;
  const [privateNotes, setPrivateNotes] = useState("");
  const [hasScannedQR, setHasScannedQR] = useState(false);
  const [localSlide, setLocalSlide] = useState(0);
  const [isSynced, setIsSynced] = useState(true);
  
  const calculateSmartAttendanceScore = (s: Student) => 100;
  const handleNextSlide = () => setCurrentSlide(currentSlide + 1);
  const handlePrevSlide = () => setCurrentSlide(Math.max(0, currentSlide - 1));
  const isMobile = false;

  const [activeTab, setActiveTab] = useState("overview");
  const [presAnalyticsTab, setPresAnalyticsTab] = useState("engagement");

  // Local States for Modals
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showCreateLecturer, setShowCreateLecturer] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Form states
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newLecturerName, setNewLecturerName] = useState("");
  const [newLecturerSubject, setNewLecturerSubject] = useState("");
  const [newLecturerCourse, setNewLecturerCourse] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionCourse, setNewSessionCourse] = useState("CS401 Deep Learning");
  const [newSessionSubject, setNewSessionSubject] = useState("Introduction");
  const [newSessionPlatform, setNewSessionPlatform] = useState("MeetPulse Live");
  const [newSessionLink, setNewSessionLink] = useState("");
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("Engineering");
  const [newEmpManager, setNewEmpManager] = useState("");

  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);

  // Filters
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Lecturer compare state
  const [compareLec1, setCompareLec1] = useState("LEC001");
  const [compareLec2, setCompareLec2] = useState("LEC002");

  const handleAssignCourse = (id: string, course: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, course } : s));
  };

  const handleAssignLecturer = (id: string, lecturer: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, lecturer } : s));
  };

  const handleSuspendStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "active" ? "suspended" : "active" } : s));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const getSidebarTabs = () => {
    let roleTabs = [];
    if (role === "superadmin") {
      roleTabs = [
        { id: "overview", label: "SaaS Overview", icon: Home },
        { id: "organizations", label: "Organizations", icon: Building },
        { id: "tiers", label: "Plan Tiers", icon: Award },
        { id: "billing", label: "SaaS Billing", icon: FileText }
      ];
    } else if (org === "education") {
      if (role === "admin") {
        roleTabs = [
          { id: "overview", label: "Dashboard Home", icon: Home },
          { id: "students", label: "Student Management", icon: Users },
          { id: "lecturers", label: "Lecturer Management", icon: Award },
          { id: "courses", label: "Course Management", icon: BookOpen },
          { id: "analytics", label: "Institution Analytics", icon: BarChart2 }
        ];
      } else if (role === "presenter") {
        roleTabs = [
          { id: "overview", label: "Lecturer Cockpit", icon: Home },
          { id: "create-session", label: "Create Session", icon: Plus },
          { id: "live", label: "Live Presentation", icon: Radio, badge: liveSessionId ? "LIVE" : undefined },
          { id: "analytics", label: "Session Analytics", icon: BarChart2 }
        ];
      } else {
        roleTabs = [
          { id: "overview", label: "Student Home", icon: Home },
          { id: "join", label: "Join Meeting / QR", icon: QrCode },
          { id: "live", label: "Synchronized Lecture", icon: Radio, badge: liveSessionId ? "LIVE" : undefined },
          { id: "learning", label: "Learning summaries", icon: Brain }
        ];
      }
    } else {
      if (role === "admin") {
        roleTabs = [
          { id: "overview", label: "Overview", icon: Home },
          { id: "employees", label: "Employees", icon: Users },
          { id: "analytics", label: "Meeting Analytics", icon: BarChart2 }
        ];
      } else if (role === "presenter") {
        roleTabs = [
          { id: "overview", label: "Manager Cockpit", icon: Home },
          { id: "create-session", label: "Create Meeting", icon: Plus },
          { id: "live", label: "Live Boardroom", icon: Radio, badge: liveSessionId ? "LIVE" : undefined },
          { id: "reports", label: "Minutes & Reports", icon: FileText }
        ];
      } else {
        roleTabs = [
          { id: "overview", label: "Employee Hub", icon: Home },
          { id: "live", label: "Live Meeting", icon: Radio, badge: liveSessionId ? "LIVE" : undefined },
          { id: "tasks", label: "Action Tasks", icon: CheckSquare }
        ];
      }
    }
    return [...roleTabs, { id: "settings", label: "Account & Settings", icon: Settings }];
  };

  const tabs = getSidebarTabs();

  return (
    <div className="flex h-screen max-h-screen w-full bg-background overflow-hidden relative text-foreground">
      {/* SIDEBAR NAVIGATION */}
      {!isMobile && (
        <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border shrink-0 flex flex-col justify-between py-6 px-4 overflow-y-auto">
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex items-center gap-2.5 px-3 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-wide">MeetPulse</span>
                <p className="text-[10px] text-indigo-400 font-medium capitalize">{org} • {role}</p>
              </div>
            </div>

            <nav className="space-y-1.5 flex-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 relative ${
                      isActive 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]" 
                        : "text-slate-400 hover:bg-sidebar-accent/80 hover:text-white"
                    }`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className="bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">{tab.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-sidebar-border/80 pt-4 px-2 space-y-3 shrink-0 mt-auto bg-sidebar">
            <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/5 p-2 rounded-2xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-md">
                  {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "MP"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white truncate" title={currentUser.name}>
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate" title={currentUser.email}>
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditName(currentUser.name);
                  setEditEmail(currentUser.email);
                  setActiveTab("settings");
                }}
                title="Account Settings"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 border border-rose-500/30 transition-all cursor-pointer shadow-sm">
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 h-16 bg-sidebar border-t border-sidebar-border z-50 flex items-center justify-around px-2">
          {tabs.slice(0, 5).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>
                <Icon className="w-5 h-5" />
                <span>{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-6 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {isMobile && (
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <h2 className="text-sm font-bold capitalize text-foreground">{role} Dashboard &gt; {activeTab}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden sm:flex items-center gap-2 bg-background/80 border border-border hover:border-indigo-500/50 px-3 py-1.5 rounded-xl text-xs text-muted-foreground transition-all cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick command...</span>
              <kbd className="bg-muted px-1.5 py-0.5 rounded text-[9px] font-mono text-muted-foreground border border-border">⌘K</kbd>
            </button>

            {liveSessionId && (
              <span className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                Live: {liveSessionId}
              </span>
            )}
            <button 
              onClick={() => {
                setEditName(currentUser.name);
                setEditEmail(currentUser.email);
                setShowSettingsModal(true);
              }}
              title="Account Settings"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer shadow-sm hover:scale-105 transition-transform">
              {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "MP"}
            </button>
          </div>
        </header>

        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onNavigate={(tab) => setActiveTab(tab)}
          onTriggerAction={(action) => {
            if (action === "ai-summary") alert("AI Executive Summary generated and copied to clipboard!");
            if (action === "ai-quiz") alert("AI Micro Quiz launched to active audience!");
            if (action === "export-pdf") alert("PDF Meeting Summary downloaded!");
          }}
        />

        <main className={`flex-1 overflow-y-auto ${isMobile ? "pb-20" : "pb-6"} p-6 bg-muted/10`}>
          {activeTab === "settings" && (
            <SettingsPage 
              currentUser={currentUser} 
              setCurrentUser={setCurrentUser} 
              role={role} 
              org={org} 
              onLogout={onLogout} 
              onDeleteAccount={onDeleteAccount} 
            />
          )}

          {activeTab === "analytics" && !(org === "education" && role === "presenter") && (
            <AnalyticsDashboard role={role} org={org} />
          )}

          {role === "superadmin" && activeTab !== "settings" && activeTab !== "analytics" && (
            <SuperAdminDashboard activeTab={activeTab} />
          )}

          {org === "education" && role === "admin" && activeTab !== "settings" && activeTab !== "analytics" && (
            <EducationAdminDashboard 
              activeTab={activeTab}
              students={students}
              lecturers={lecturers}
              courses={courses}
              sessions={sessions}
              liveSessionId={liveSessionId}
              activityFeed={activityFeed}
              studentSearch={studentSearch}
              setStudentSearch={setStudentSearch}
              studentFilter={studentFilter}
              setStudentFilter={setStudentFilter}
              compareLec1={compareLec1}
              setCompareLec1={setCompareLec1}
              compareLec2={compareLec2}
              setCompareLec2={setCompareLec2}
              setShowCSVModal={setShowCSVModal}
              setShowCreateStudent={setShowCreateStudent}
              setShowCreateLecturer={setShowCreateLecturer}
              setShowCreateCourse={setShowCreateCourse}
              setSelectedStudentDetail={setSelectedStudentDetail}
              handleAssignCourse={handleAssignCourse}
              handleAssignLecturer={handleAssignLecturer}
              handleSuspendStudent={handleSuspendStudent}
              handleDeleteStudent={handleDeleteStudent}
              calculateSmartAttendanceScore={calculateSmartAttendanceScore}
            />
          )}

          {org === "education" && role === "presenter" && activeTab !== "settings" && (
            <LecturerPresenterDashboard 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sessions={sessions}
              liveSessionId={liveSessionId}
              setLiveSessionId={setLiveSessionId}
              currentSlide={currentSlide}
              handlePrevSlide={handlePrevSlide}
              handleNextSlide={handleNextSlide}
              setAudienceCount={setAudienceCount}
              liveReactions={liveReactions}
              livePoll={livePoll}
              setLivePoll={setLivePoll}
              liveQuestions={liveQuestions}
              markQuestionAnswered={markQuestionAnswered}
              pulseScore={pulseScore}
              setPulseScore={setPulseScore}
              speakingPace={speakingPace}
              newSessionName={newSessionName}
              setNewSessionName={setNewSessionName}
              newSessionCourse={newSessionCourse}
              setNewSessionCourse={setNewSessionCourse}
              newSessionSubject={newSessionSubject}
              setNewSessionSubject={setNewSessionSubject}
              newSessionPlatform={newSessionPlatform}
              setNewSessionPlatform={setNewSessionPlatform}
              newSessionLink={newSessionLink}
              setNewSessionLink={setNewSessionLink}
              setSessions={setSessions}
              presAnalyticsTab={presAnalyticsTab}
              setPresAnalyticsTab={setPresAnalyticsTab}
              activeDocumentName={activeDocumentName}
              setActiveDocumentName={setActiveDocumentName}
              quizStats={quizStats}
              activeAlerts={activeAlerts}
              removeAlert={removeAlert}
              confusionAlerts={[]}
            />
          )}

          {org === "education" && role === "participant" && activeTab !== "settings" && activeTab !== "analytics" && (
            <StudentParticipantDashboard 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              liveSessionId={liveSessionId}
              setLiveSessionId={setLiveSessionId}
              hasScannedQR={hasScannedQR}
              setHasScannedQR={setHasScannedQR}
              isSynced={isSynced}
              setIsSynced={setIsSynced}
              currentSlide={currentSlide}
              localSlide={localSlide}
              setLocalSlide={setLocalSlide}
              triggerReaction={triggerReaction}
              privateNotes={privateNotes}
              setPrivateNotes={setPrivateNotes}
              livePoll={livePoll}
              submitVote={submitVote}
              askQuestion={askQuestion}
              upvoteQuestion={upvoteQuestion}
              liveQuestions={liveQuestions}
              sessions={sessions}
              activeDocumentName={activeDocumentName}
              setActiveDocumentName={setActiveDocumentName}
              activeQuiz={activeQuiz}
            />
          )}

          {org === "business" && role === "admin" && activeTab !== "settings" && activeTab !== "analytics" && (
            <BusinessAdminDashboard 
              activeTab={activeTab}
              employees={employees}
              sessions={sessions}
              activityFeed={activityFeed}
              setShowEmployeeModal={setShowEmployeeModal}
            />
          )}

          {org === "business" && role === "presenter" && activeTab !== "settings" && activeTab !== "analytics" && (
            <BusinessPresenterDashboard 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              liveSessionId={liveSessionId}
              setLiveSessionId={setLiveSessionId}
              currentSlide={currentSlide}
              handlePrevSlide={handlePrevSlide}
              handleNextSlide={handleNextSlide}
              triggerReaction={triggerReaction}
              askQuestion={askQuestion}
            />
          )}

          {org === "business" && role === "participant" && activeTab !== "settings" && activeTab !== "analytics" && (
            <BusinessEmployeeDashboard 
              activeTab={activeTab}
              liveSessionId={liveSessionId}
              setLiveSessionId={setLiveSessionId}
              currentSlide={currentSlide}
              triggerReaction={triggerReaction}
              askQuestion={askQuestion}
            />
          )}
        </main>
      </div>

      {/* Account Settings Floating Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Account Settings</h3>
                    <p className="text-xs text-muted-foreground">Manage your personal profile and account security</p>
                  </div>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg hover:bg-muted/20">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editName.trim() || !editEmail.trim()) {
                  alert("Name and email cannot be empty.");
                  return;
                }
                setCurrentUser({ name: editName.trim(), email: editEmail.trim() });
                setShowSettingsModal(false);
                alert("Account details updated successfully!");
              }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Full Name</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    placeholder="Your Full Name" 
                    className="w-full bg-input border border-border px-3.5 py-2.5 text-xs rounded-xl outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail} 
                    onChange={e => setEditEmail(e.target.value)} 
                    placeholder="name@example.com" 
                    className="w-full bg-input border border-border px-3.5 py-2.5 text-xs rounded-xl outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowSettingsModal(false)} 
                    className="bg-muted/20 hover:bg-muted/30 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer">
                    Save Changes
                  </button>
                </div>
              </form>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Danger Zone</span>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-rose-400">Delete Account</h4>
                    <p className="text-[10px] text-muted-foreground">Permanently delete your profile and workspace access.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                        setShowSettingsModal(false);
                        onDeleteAccount();
                      }
                    }} 
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-sm">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
