import React from "react";
import { Users, Award, BookOpen, Radio, Brain, Activity, Plus, Search, Trash2, Star } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { StatCard } from "../../components/common/CommonUI";
import { Student, Lecturer, Course, Session } from "../../types";

export function EducationAdminDashboard({
  activeTab,
  students,
  lecturers,
  courses,
  sessions,
  liveSessionId,
  activityFeed,
  studentSearch,
  setStudentSearch,
  studentFilter,
  setStudentFilter,
  compareLec1,
  setCompareLec1,
  compareLec2,
  setCompareLec2,
  setShowCSVModal,
  setShowCreateStudent,
  setShowCreateLecturer,
  setShowCreateCourse,
  setSelectedStudentDetail,
  handleAssignCourse,
  handleAssignLecturer,
  handleSuspendStudent,
  handleDeleteStudent,
  calculateSmartAttendanceScore
}: {
  activeTab: string;
  students: Student[];
  lecturers: Lecturer[];
  courses: Course[];
  sessions: Session[];
  liveSessionId: string | null;
  activityFeed: { time: string; text: string }[];
  studentSearch: string;
  setStudentSearch: (v: string) => void;
  studentFilter: string;
  setStudentFilter: (v: string) => void;
  compareLec1: string;
  setCompareLec1: (v: string) => void;
  compareLec2: string;
  setCompareLec2: (v: string) => void;
  setShowCSVModal: (v: boolean) => void;
  setShowCreateStudent: (v: boolean) => void;
  setShowCreateLecturer: (v: boolean) => void;
  setShowCreateCourse: (v: boolean) => void;
  setSelectedStudentDetail: (s: Student) => void;
  handleAssignCourse: (id: string, c: string) => void;
  handleAssignLecturer: (id: string, l: string) => void;
  handleSuspendStudent: (id: string) => void;
  handleDeleteStudent: (id: string) => void;
  calculateSmartAttendanceScore: (s: Student) => number;
}) {
  // ── Derived stats from real data ────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Sessions created/scheduled today
  const todaysSessions = sessions.filter(s => s.date === today);
  // Sessions ended with analytics
  const endedSessions = sessions.filter(s => s.status === "ended" && s.analytics && Object.keys(s.analytics).length > 0);

  // Stats computed from data
  const sessionsToday = todaysSessions.length;
  const activeMeetingsCount = liveSessionId ? 1 : 0;

  const avgPulseAll = endedSessions.length > 0
    ? Math.round(endedSessions.reduce((acc, s) => acc + (s.analytics?.pulseScore || 0), 0) / endedSessions.length)
    : 0;

  const avgAttendanceToday = todaysSessions.length > 0
    ? Math.round(todaysSessions.reduce((acc, s) => acc + (s.analytics?.audienceCount || 0), 0) / todaysSessions.length)
    : 0;

  const questionsTodayCount = todaysSessions.reduce((acc, s) =>
    acc + (s.analytics?.liveQuestions?.length || 0), 0);

  // Students/lecturers added in the past 7 days (by ID prefix heuristic — we don't have created_at on Student)
  // Fall back to showing total counts in the change string.
  const studentsChange = students.length > 0 ? `${students.length} total` : "None yet";
  const lecturersChange = lecturers.length > 0 ? `${lecturers.length} total` : "None yet";
  const coursesChange = courses.length > 0 ? `${courses.length} total` : "None yet";

  // Analytics tab computed values
  const avgEngagement = endedSessions.length > 0
    ? (endedSessions.reduce((acc, s) => acc + (s.analytics?.pulseScore || 0), 0) / endedSessions.length).toFixed(1)
    : "0.0";

  const avgUnderstanding = endedSessions.length > 0
    ? (endedSessions.reduce((acc, s) => {
        const qs: any[] = s.analytics?.liveQuestions || [];
        const answered = qs.filter((q: any) => q.isAnswered).length;
        const total = qs.length;
        return acc + (total > 0 ? (answered / total) * 100 : 0);
      }, 0) / endedSessions.length).toFixed(1)
    : "0.0";

  const questionsPerWeek = sessions
    .filter(s => s.date >= oneWeekAgo)
    .reduce((acc, s) => acc + (s.analytics?.liveQuestions?.length || 0), 0);

  const avgSmartAttendance = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + calculateSmartAttendanceScore(s), 0) / students.length)
    : 0;

  // Monthly chart data derived from real sessions
  const monthlyData = React.useMemo(() => {
    const monthMap: Record<string, { attendance: number; engagement: number; count: number }> = {};
    sessions.forEach(s => {
      if (!s.date) return;
      const d = new Date(s.date);
      const key = d.toLocaleString("default", { month: "short" });
      if (!monthMap[key]) monthMap[key] = { attendance: 0, engagement: 0, count: 0 };
      monthMap[key].attendance += s.analytics?.audienceCount || 0;
      monthMap[key].engagement += s.analytics?.pulseScore || 0;
      monthMap[key].count += 1;
    });
    return Object.entries(monthMap)
      .map(([month, v]) => ({
        month,
        attendance: v.count > 0 ? Math.round(v.attendance / v.count) : 0,
        engagement: v.count > 0 ? Math.round(v.engagement / v.count) : 0,
      }))
      .slice(-6); // last 6 months
  }, [sessions]);

  // Department comparison from courses
  const departmentData = React.useMemo(() => {
    return courses.map(c => ({
      name: c.name.length > 12 ? c.name.substring(0, 12) + "…" : c.name,
      attendance: c.attendance,
      engagement: c.engagement,
      avgUnderstanding: c.engagement, // best proxy we have
    }));
  }, [courses]);

  // Dynamic dropdown options
  const courseOptions = courses.map(c => c.name);
  const lecturerOptions = lecturers.map(l => l.name);
  const courseFilterOptions = ["all", ...courseOptions];

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Students" value={students.length.toString()} change={studentsChange} icon={Users} gradient="from-indigo-500 to-purple-500" />
          <StatCard label="Total Lecturers" value={lecturers.length.toString()} change={lecturersChange} icon={Award} gradient="from-purple-500 to-pink-500" />
          <StatCard label="Active Courses" value={courses.length.toString()} change={coursesChange} icon={BookOpen} gradient="from-cyan-500 to-blue-500" />
          <StatCard label="Active Presentations" value={activeMeetingsCount.toString()} change={liveSessionId ? "LIVE" : "Inactive"} icon={Radio} gradient="from-rose-500 to-orange-500" />
          <StatCard label="Avg Engagement Score" value={avgPulseAll > 0 ? `${avgPulseAll}%` : "—"} change={endedSessions.length > 0 ? `From ${endedSessions.length} sessions` : "No ended sessions"} icon={Brain} gradient="from-emerald-500 to-teal-500" />
        </div>

        {/* Secondary overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Sessions Today</p>
            <h4 className="text-lg font-bold text-foreground">{sessionsToday > 0 ? `${sessionsToday} Session${sessionsToday !== 1 ? "s" : ""}` : "None"}</h4>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Audience Today</p>
            <h4 className={`text-lg font-bold ${avgAttendanceToday > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
              {avgAttendanceToday > 0 ? `${avgAttendanceToday} participants` : "—"}
            </h4>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Active Meetings</p>
            <h4 className="text-lg font-bold text-foreground">{activeMeetingsCount > 0 ? `${activeMeetingsCount} Live` : "None"}</h4>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Questions Today</p>
            <h4 className={`text-lg font-bold ${questionsTodayCount > 0 ? "text-primary" : "text-muted-foreground"}`}>
              {questionsTodayCount > 0 ? `${questionsTodayCount} Asked` : "—"}
            </h4>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              Live Activity Feed
            </h3>
            <span className="text-[10px] text-muted-foreground">Real-time platform logs</span>
          </div>
          <div className="space-y-3">
            {activityFeed.length > 0 ? activityFeed.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">{activity.time}</span>
                <span className="text-foreground">{activity.text}</span>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-4">No activity yet. Start a live session to see real-time logs.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "students") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm">Student Directory</h3>
            <p className="text-xs text-muted-foreground">Manage enrolment, view attendance scores and assign metadata</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCSVModal(true)} className="bg-white/5 border border-border hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
              Import CSV
            </button>
            <button onClick={() => setShowCreateStudent(true)} className="bg-primary text-white hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Create Student
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 bg-background border border-border rounded-xl px-3 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              placeholder="Search student directories..."
              className="bg-transparent text-xs w-full outline-none"
            />
          </div>
          <select
            value={studentFilter}
            onChange={e => setStudentFilter(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none">
            {courseFilterOptions.map(opt => (
              <option key={opt} value={opt}>{opt === "all" ? "All Courses" : opt}</option>
            ))}
          </select>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Course</th>
                <th className="pb-3">Lecturer</th>
                <th className="pb-3">Smart Att %</th>
                <th className="pb-3">Engagement %</th>
                <th className="pb-3">Questions</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {students
                .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                .filter(s => studentFilter === "all" || s.course === studentFilter)
                .map((student) => (
                  <tr key={student.id} className="group hover:bg-muted/10">
                    <td className="py-3 font-semibold">{student.name}</td>
                    <td className="py-3 text-muted-foreground">{student.email}</td>
                    <td className="py-3">
                      <select
                        value={student.course}
                        onChange={e => handleAssignCourse(student.id, e.target.value)}
                        className="bg-background border border-border px-2 py-1 rounded outline-none text-[11px]">
                        {courseOptions.length > 0
                          ? courseOptions.map(c => <option key={c} value={c}>{c}</option>)
                          : <option value={student.course}>{student.course}</option>}
                      </select>
                    </td>
                    <td className="py-3">
                      <select
                        value={student.lecturer}
                        onChange={e => handleAssignLecturer(student.id, e.target.value)}
                        className="bg-background border border-border px-2 py-1 rounded outline-none text-[11px]">
                        {lecturerOptions.length > 0
                          ? lecturerOptions.map(l => <option key={l} value={l}>{l}</option>)
                          : <option value={student.lecturer}>{student.lecturer}</option>}
                      </select>
                    </td>
                    <td className="py-3 font-mono font-bold text-indigo-400">{calculateSmartAttendanceScore(student)}%</td>
                    <td className="py-3 font-mono">{student.engagement}%</td>
                    <td className="py-3 font-mono">{student.questionsCount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        student.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedStudentDetail(student)} className="text-primary hover:underline font-bold cursor-pointer">Profile</button>
                      <button onClick={() => handleSuspendStudent(student.id)} className="text-amber-400 hover:underline font-bold cursor-pointer">Suspend</button>
                      <button onClick={() => handleDeleteStudent(student.id)} className="text-rose-400 hover:underline font-bold cursor-pointer"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                    </td>
                  </tr>
                ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-xs text-muted-foreground">
                    No students found. Create or import students to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === "lecturers") {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">Faculty Directory</h3>
              <p className="text-xs text-muted-foreground">Inspect classroom ratings, subjects and pacing coach diagnostics.</p>
            </div>
            <button onClick={() => setShowCreateLecturer(true)} className="bg-primary text-white hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Lecturer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold">
                  <th className="pb-3">Lecturer</th>
                  <th className="pb-3">Assigned Courses</th>
                  <th className="pb-3">Subjects</th>
                  <th className="pb-3">Average Rating</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {lecturers.map(lec => (
                  <tr key={lec.id} className="group hover:bg-muted/10">
                    <td className="py-3 font-semibold">{lec.name}</td>
                    <td className="py-3 text-muted-foreground">{lec.courses.length > 0 ? lec.courses.join(", ") : <span className="text-muted-foreground/50 italic">Unassigned</span>}</td>
                    <td className="py-3">{lec.subjects.length > 0 ? lec.subjects.join(", ") : <span className="text-muted-foreground/50 italic">—</span>}</td>
                    <td className="py-3 font-mono font-bold text-amber-400 flex items-center gap-1">
                      {lec.rating > 0 ? (
                        <><Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />{lec.rating}</>
                      ) : (
                        <span className="text-muted-foreground/50 italic text-[11px]">No rating yet</span>
                      )}
                    </td>
                    <td className="py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      {lec.coachingReport ? (
                        <button onClick={() => alert(`AI Coaching Report for ${lec.name}:\n\n${lec.coachingReport}`)} className="text-primary hover:underline font-bold cursor-pointer">Coaching Report</button>
                      ) : (
                        <span className="text-muted-foreground/50 text-[11px] italic">No report yet</span>
                      )}
                    </td>
                  </tr>
                ))}
                {lecturers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                      No lecturers found. Add lecturers to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lecturer Comparisons */}
        {lecturers.length >= 2 && (
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm">Professor/Lecturer Performance Benchmark</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">LECTURER A</label>
                <select value={compareLec1} onChange={e => setCompareLec1(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs">
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">LECTURER B</label>
                <select value={compareLec2} onChange={e => setCompareLec2(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs">
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              {[compareLec1, compareLec2].map((lecId, idx) => {
                const lec = lecturers.find(l => l.id === lecId);
                if (!lec) return null;
                return (
                  <div key={lecId} className="p-4 bg-muted/10 border border-border rounded-2xl flex flex-col justify-between text-xs space-y-4">
                    <div className={`flex justify-between items-center border-b border-border pb-2`}>
                      <span className={`font-bold ${idx === 0 ? "text-primary" : "text-secondary"}`}>{lec.name}</span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${idx === 0 ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>{lec.id.substring(0, 8)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Average Rating</span><span className="font-bold text-amber-400">{lec.rating > 0 ? `${lec.rating} / 5.0` : "—"}</span></div>
                      <div className="flex justify-between"><span>Assigned Courses</span><span className="font-semibold">{lec.courses.length > 0 ? lec.courses.join(", ") : "—"}</span></div>
                      <div className="flex justify-between"><span>Core Subjects</span><span className="font-semibold">{lec.subjects.length > 0 ? lec.subjects.join(", ") : "—"}</span></div>
                      <div className="flex justify-between"><span>Attendance Index</span><span className="font-bold text-emerald-400">{lec.attendance > 0 ? `${lec.attendance}%` : "—"}</span></div>
                    </div>
                    {lec.coachingReport && (
                      <div className="p-2.5 bg-background border border-border rounded-xl text-[10px] leading-relaxed text-muted-foreground">
                        <strong>Pace Coach AI:</strong> {lec.coachingReport}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { metric: "Rating", LecA: (lecturers.find(l => l.id === compareLec1)?.rating || 0) * 20, LecB: (lecturers.find(l => l.id === compareLec2)?.rating || 0) * 20 },
                  { metric: "Attendance", LecA: lecturers.find(l => l.id === compareLec1)?.attendance || 0, LecB: lecturers.find(l => l.id === compareLec2)?.attendance || 0 },
                  { metric: "Courses", LecA: (lecturers.find(l => l.id === compareLec1)?.courses.length || 0) * 30, LecB: (lecturers.find(l => l.id === compareLec2)?.courses.length || 0) * 30 },
                  { metric: "Subjects", LecA: (lecturers.find(l => l.id === compareLec1)?.subjects.length || 0) * 30, LecB: (lecturers.find(l => l.id === compareLec2)?.subjects.length || 0) * 30 },
                ]}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="metric" />
                  <Radar name={lecturers.find(l => l.id === compareLec1)?.name || ""} dataKey="LecA" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
                  <Radar name={lecturers.find(l => l.id === compareLec2)?.name || ""} dataKey="LecB" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.25} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {lecturers.length < 2 && lecturers.length > 0 && (
          <div className="bg-card border border-border rounded-3xl p-6 text-center text-xs text-muted-foreground">
            Add at least 2 lecturers to enable the Performance Benchmark comparison.
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "courses") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">Course Catalog</h3>
            <p className="text-xs text-muted-foreground">Direct access to enrolled counts, averages and archives.</p>
          </div>
          <button onClick={() => setShowCreateCourse(true)} className="bg-primary text-white hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Create Course
          </button>
        </div>

        {courses.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-card border border-border rounded-3xl p-6 space-y-4 hover:border-primary/20 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">{course.id}</span>
                    <h4 className="font-bold text-base mt-2">{course.name}</h4>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{course.studentsCount} Students</span>
                </div>

                <div className="space-y-2 border-t border-border/50 pt-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Lecturer:</span>
                    <span className="text-foreground font-semibold">{course.lecturer || "—"}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Avg Attendance:</span>
                    <span className={`font-bold ${course.attendance > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>{course.attendance > 0 ? `${course.attendance}%` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Avg Engagement:</span>
                    <span className={`font-bold ${course.engagement > 0 ? "text-indigo-400" : "text-muted-foreground"}`}>{course.engagement > 0 ? `${course.engagement}%` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subjects:</span>
                    <span className="text-foreground truncate max-w-[120px]">{course.subjects.length > 0 ? course.subjects.join(", ") : "—"}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-border/30">
                  <button onClick={() => alert(`Course Archive: ${course.name}\n\nAll historical sessions have been processed.`)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer">Archive</button>
                  <button onClick={() => alert(`Analytics details:\n\nAttendance: ${course.attendance > 0 ? course.attendance + "%" : "No data"}\nEngagement: ${course.engagement > 0 ? course.engagement + "%" : "No data"}`)} className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer">Analytics</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl p-12 text-center text-xs text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-foreground mb-1">No courses yet</p>
            <p>Create your first course to get started.</p>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "analytics") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Avg Engagement Score</span>
            <span className="text-lg font-bold text-indigo-400">{avgEngagement !== "0.0" ? `${avgEngagement}%` : "—"}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Avg Answer Rate</span>
            <span className="text-lg font-bold text-accent">{avgUnderstanding !== "0.0" ? `${avgUnderstanding}%` : "—"}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Questions This Week</span>
            <span className="text-lg font-bold text-primary">{questionsPerWeek > 0 ? `${questionsPerWeek} asked` : "—"}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Avg Smart Attendance</span>
            <span className="text-lg font-bold text-emerald-400">{avgSmartAttendance > 0 ? `${avgSmartAttendance}%` : "—"}</span>
          </div>
        </div>

        {monthlyData.length > 0 || departmentData.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <h4 className="font-bold text-sm">Attendance & Engagement Trends</h4>
              {monthlyData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="attendance" stroke="#6366F1" strokeWidth={2.5} name="Avg Audience" />
                      <Line type="monotone" dataKey="engagement" stroke="#22D3EE" strokeWidth={2.5} name="Engagement %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
                  End sessions to generate trend data.
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <h4 className="font-bold text-sm">Course Comparison Metrics</h4>
              {departmentData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Attendance %" />
                      <Bar dataKey="engagement" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Engagement %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
                  No courses with analytics data yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl p-12 text-center text-xs text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-foreground mb-1">No analytics data yet</p>
            <p>Complete sessions and end them to generate analytics.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-3xl space-y-3">
      <p className="font-bold text-foreground">Welcome to Education Admin Workspace</p>
      <p>Select a tab from the sidebar to begin.</p>
    </div>
  );
}
