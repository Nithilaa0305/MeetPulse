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
    departments, employees, setEmployees, sessions, setSessions, fetchData,
    updateUserProfile, deleteUserProfile,
    createStudent, createLecturer, createCourse, createEmployee,
    updateCourse, deleteCourse, createDepartment, deleteDepartment
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

  // Edit Modals
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const [showEditLecturer, setShowEditLecturer] = useState(false);
  const [editLecturer, setEditLecturer] = useState<Lecturer | null>(null);

  // Form states
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentYear, setNewStudentYear] = useState("1st Year");
  const [newStudentSemester, setNewStudentSemester] = useState("Semester 1");
  const [newStudentDepartment, setNewStudentDepartment] = useState("");
  const [newStudentCourseId, setNewStudentCourseId] = useState("");
  const [newLecturerName, setNewLecturerName] = useState("");
  const [newLecturerEmail, setNewLecturerEmail] = useState("");
  const [newLecturerEmpId, setNewLecturerEmpId] = useState("");
  const [newLecturerDepartment, setNewLecturerDepartment] = useState("");
  const [newLecturerSubject, setNewLecturerSubject] = useState("");
  const [newLecturerCourse, setNewLecturerCourse] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseDepartment, setNewCourseDepartment] = useState("");
  const [newCourseYear, setNewCourseYear] = useState("1st Year");
  const [newCourseSemester, setNewCourseSemester] = useState("Semester 1");
  const [newCourseLecturerId, setNewCourseLecturerId] = useState("");
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
    updateUserProfile(id, { assigned_course: course });
  };

  const handleAssignLecturer = (id: string, lecturer: string) => {
    updateUserProfile(id, { assigned_lecturer: lecturer });
  };

  const handleSuspendStudent = (id: string) => {
    const student = students.find(s => s.id === id) || employees.find(e => e.id === id);
    if (student) {
      updateUserProfile(id, { status: student.status === "active" ? "suspended" : "active" }, student.isPending);
    }
  };

  const handleDeleteStudent = (id: string) => {
    const isPending = students.find(s => s.id === id)?.isPending || employees.find(e => e.id === id)?.isPending;
    deleteUserProfile(id, isPending);
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
          { id: "departments", label: "Departments", icon: Building },
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

          {activeTab === "analytics" && !(org === "education" && role === "presenter") && !(org === "education" && role === "admin") && (
            <AnalyticsDashboard role={role} org={org} />
          )}

          {role === "superadmin" && activeTab !== "settings" && activeTab !== "analytics" && (
            <SuperAdminDashboard activeTab={activeTab} />
          )}

          {org === "education" && role === "admin" && activeTab !== "settings" && (
            <EducationAdminDashboard 
              activeTab={activeTab}
              students={students}
              lecturers={lecturers}
              courses={courses}
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
              onEditStudent={(s) => { setEditStudent(s); setShowEditStudent(true); }}
              onEditCourse={(c) => { setEditCourse(c); setShowEditCourse(true); }}
              onEditLecturer={(lec) => {
                setEditLecturer(lec);
                setShowEditLecturer(true);
              }}
              onDeleteCourse={deleteCourse}
              onDeleteLecturer={(id) => {
                if (confirm("Are you sure you want to delete this lecturer?")) {
                  const isPending = lecturers.find(l => l.id === id)?.isPending;
                  deleteUserProfile(id, isPending);
                }
              }}
              departments={departments}
              createDepartment={createDepartment}
              deleteDepartment={deleteDepartment}
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

      {/* Create Student Floating Modal */}
      <AnimatePresence>
        {showCreateStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Create Student</h3>
                <button onClick={() => setShowCreateStudent(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">FULL NAME</label>
                    <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Alice Johnson" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">EMAIL ADDRESS</label>
                    <input type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} placeholder="alice@university.edu" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">YEAR</label>
                    <select value={newStudentYear} onChange={e => {
                      setNewStudentYear(e.target.value);
                      setNewStudentCourseId("");
                    }} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SEMESTER</label>
                    <select value={newStudentSemester} onChange={e => {
                      setNewStudentSemester(e.target.value);
                      setNewStudentCourseId("");
                    }} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">DEPARTMENT</label>
                  <select value={newStudentDepartment} onChange={e => setNewStudentDepartment(e.target.value)} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">ASSIGN COURSE</label>
                  <select value={newStudentCourseId} onChange={e => setNewStudentCourseId(e.target.value)} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                    <option value="">Unassigned</option>
                    {courses
                      .filter(c => c.year === newStudentYear && c.semester === newStudentSemester)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreateStudent(false)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">Cancel</button>
                <button onClick={() => {
                  if (newStudentName && newStudentEmail) {
                    const selectedCourse = courses.find(c => c.id === newStudentCourseId);
                    const courseName = selectedCourse ? selectedCourse.name : "Unassigned";
                    const lecturerName = selectedCourse ? selectedCourse.lecturer : "Unassigned";
                    
                    createStudent(newStudentName, newStudentEmail, newStudentYear, newStudentSemester, newStudentDepartment, courseName, lecturerName);
                    
                    setNewStudentName("");
                    setNewStudentEmail("");
                    setNewStudentCourseId("");
                    setNewStudentDepartment("");
                    setShowCreateStudent(false);
                  }
                }} className="bg-primary text-white hover:opacity-90 px-4 py-1.5 rounded-xl text-xs font-bold">Create Student</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lecturer Floating Modal */}
      <AnimatePresence>
        {showCreateLecturer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Add Lecturer</h3>
                <button onClick={() => setShowCreateLecturer(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">FULL NAME</label>
                  <input value={newLecturerName} onChange={e => setNewLecturerName(e.target.value)} placeholder="Dr. John Smith" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">EMAIL ADDRESS</label>
                    <input type="email" value={newLecturerEmail} onChange={e => setNewLecturerEmail(e.target.value)} placeholder="john@univ.edu" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">COURSE ID</label>
                    <input value={newLecturerEmpId} onChange={e => setNewLecturerEmpId(e.target.value)} placeholder="CS401" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">DEPARTMENT</label>
                  <select value={newLecturerDepartment} onChange={e => setNewLecturerDepartment(e.target.value)} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">PRIMARY SUBJECT</label>
                  <input value={newLecturerSubject} onChange={e => setNewLecturerSubject(e.target.value)} placeholder="Deep Learning" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreateLecturer(false)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">Cancel</button>
                <button onClick={() => {
                  if (newLecturerName && newLecturerEmail && newLecturerEmpId && newLecturerSubject) {
                    createLecturer(newLecturerName, newLecturerEmail, newLecturerEmpId, newLecturerDepartment, newLecturerSubject);
                    setNewLecturerName("");
                    setNewLecturerEmail("");
                    setNewLecturerEmpId("");
                    setNewLecturerDepartment("");
                    setNewLecturerSubject("");
                    setShowCreateLecturer(false);
                  }
                }} className="bg-primary text-white hover:opacity-90 px-4 py-1.5 rounded-xl text-xs font-bold">Add Faculty</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Course Floating Modal */}
      <AnimatePresence>
        {showCreateCourse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Create Course</h3>
                <button onClick={() => setShowCreateCourse(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">COURSE CODE</label>
                    <input value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} placeholder="CS401" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">COURSE NAME</label>
                    <input value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="Deep Learning" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">YEAR</label>
                    <select value={newCourseYear} onChange={e => setNewCourseYear(e.target.value)} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SEMESTER</label>
                    <select value={newCourseSemester} onChange={e => setNewCourseSemester(e.target.value)} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">DEPARTMENT</label>
                  <select value={newCourseDepartment} onChange={e => setNewCourseDepartment(e.target.value)} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">ASSIGN LECTURER</label>
                  <select value={newCourseLecturerId} onChange={e => setNewCourseLecturerId(e.target.value)} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                    <option value="">Unassigned</option>
                    {lecturers.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreateCourse(false)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">Cancel</button>
                <button onClick={() => {
                  if (newCourseName && newCourseCode) {
                    const lecturerName = lecturers.find(l => l.id === newCourseLecturerId)?.name || "Unassigned";
                    createCourse(newCourseName, newCourseCode, newCourseYear, newCourseSemester, newCourseDepartment, newCourseLecturerId, lecturerName);
                    setNewCourseName("");
                    setNewCourseCode("");
                    setNewCourseDepartment("");
                    setNewCourseLecturerId("");
                    setShowCreateCourse(false);
                  }
                }} className="bg-primary text-white hover:opacity-90 px-4 py-1.5 rounded-xl text-xs font-bold">Create Course</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Employee / Add Employee Floating Modal */}
      <AnimatePresence>
        {showEmployeeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Invite Employee</h3>
                <button onClick={() => setShowEmployeeModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">EMPLOYEE NAME</label>
                  <input value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="Sarah Jenkins" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">DEPARTMENT</label>
                  <input value={newEmpDept} onChange={e => setNewEmpDept(e.target.value)} placeholder="Engineering" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">MANAGER</label>
                  <input value={newEmpManager} onChange={e => setNewEmpManager(e.target.value)} placeholder="John Doe" className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowEmployeeModal(false)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">Cancel</button>
                <button onClick={() => {
                  if (newEmpName) {
                    createEmployee(newEmpName, newEmpDept, newEmpManager);
                    setNewEmpName("");
                    setNewEmpManager("");
                    setShowEmployeeModal(false);
                  }
                }} className="bg-primary text-white hover:opacity-90 px-4 py-1.5 rounded-xl text-xs font-bold">Invite Employee</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Student Floating Modal */}
      <AnimatePresence>
        {showEditStudent && editStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Edit Student</h3>
                <button onClick={() => setShowEditStudent(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">FULL NAME</label>
                    <input value={editStudent.name} onChange={e => setEditStudent({ ...editStudent, name: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">EMAIL ADDRESS</label>
                    <input type="email" value={editStudent.email} onChange={e => setEditStudent({ ...editStudent, email: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">YEAR</label>
                    <select value={editStudent.year || "1st Year"} onChange={e => setEditStudent({ ...editStudent, year: e.target.value, course: "Unassigned" })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SEMESTER</label>
                    <select value={editStudent.semester || "Semester 1"} onChange={e => setEditStudent({ ...editStudent, semester: e.target.value, course: "Unassigned" })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">ASSIGN COURSE</label>
                  <select value={editStudent.course} onChange={e => setEditStudent({ ...editStudent, course: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                    <option value="Unassigned">Unassigned</option>
                    {courses
                      .filter(c => c.year === editStudent.year && c.semester === editStudent.semester)
                      .map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowEditStudent(false)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">Cancel</button>
                <button onClick={() => {
                  const selectedCourse = courses.find(c => c.name === editStudent.course);
                  updateUserProfile(editStudent.id, { 
                    full_name: editStudent.name, 
                    email: editStudent.email,
                    year: editStudent.year,
                    semester: editStudent.semester,
                    assigned_course: editStudent.course,
                    assigned_lecturer: selectedCourse ? selectedCourse.lecturer : "Unassigned"
                  });
                  setShowEditStudent(false);
                }} className="bg-primary text-white hover:opacity-90 px-4 py-1.5 rounded-xl text-xs font-bold">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Course Floating Modal */}
      <AnimatePresence>
        {showEditCourse && editCourse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Edit Course</h3>
                <button onClick={() => setShowEditCourse(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">COURSE CODE</label>
                    <input value={editCourse.code || ''} onChange={e => setEditCourse({ ...editCourse, code: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">COURSE NAME</label>
                    <input value={editCourse.name} onChange={e => setEditCourse({ ...editCourse, name: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">YEAR</label>
                    <select value={editCourse.year || "1st Year"} onChange={e => setEditCourse({ ...editCourse, year: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SEMESTER</label>
                    <select value={editCourse.semester || "Semester 1"} onChange={e => setEditCourse({ ...editCourse, semester: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">ASSIGN LECTURER</label>
                  <select value={editCourse.lecturer_id || ""} onChange={e => {
                    const l = lecturers.find(l => l.id === e.target.value);
                    setEditCourse({ ...editCourse, lecturer_id: e.target.value, lecturer: l ? l.name : "Unassigned" });
                  }} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none appearance-none">
                    <option value="">Unassigned</option>
                    {lecturers.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowEditCourse(false)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">Cancel</button>
                <button onClick={() => {
                  updateCourse(editCourse.id, { 
                    name: editCourse.name,
                    code: editCourse.code,
                    year: editCourse.year,
                    semester: editCourse.semester,
                    lecturer_id: editCourse.lecturer_id || null,
                    lecturer_name: editCourse.lecturer
                  });
                  setShowEditCourse(false);
                }} className="bg-primary text-white hover:opacity-90 px-4 py-1.5 rounded-xl text-xs font-bold">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Lecturer Floating Modal */}
      <AnimatePresence>
        {showEditLecturer && editLecturer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Edit Lecturer</h3>
                <button onClick={() => setShowEditLecturer(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">FULL NAME</label>
                    <input value={editLecturer.name} onChange={e => setEditLecturer({ ...editLecturer, name: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">EMPLOYEE ID / CODE</label>
                    <input value={editLecturer.emp_id || ''} onChange={e => setEditLecturer({ ...editLecturer, emp_id: e.target.value })} className="w-full bg-input border border-border px-3 py-2 text-xs rounded-xl outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowEditLecturer(false)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">Cancel</button>
                <button onClick={() => {
                  updateUserProfile(editLecturer.id, { 
                    full_name: editLecturer.name,
                    emp_id: editLecturer.emp_id || null
                  }, editLecturer.isPending);
                  setShowEditLecturer(false);
                }} className="bg-primary text-white hover:opacity-90 px-4 py-1.5 rounded-xl text-xs font-bold">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
