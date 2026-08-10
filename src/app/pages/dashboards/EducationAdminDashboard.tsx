import React, { useState } from "react";
import { Users, Award, BookOpen, Radio, Brain, Activity, Plus, Search, Trash2, Star, Building } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { StatCard } from "../../components/common/CommonUI";
import { Student, Lecturer, Course } from "../../types";
import { attendanceTrendData, departmentComparisonData } from "../../data/mockData";

export function EducationAdminDashboard({
  activeTab,
  students,
  lecturers,
  courses,
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
  calculateSmartAttendanceScore,
  onEditStudent,
  onEditCourse,
  onEditLecturer,
  onDeleteCourse,
  onDeleteLecturer,
  departments,
  createDepartment,
  deleteDepartment
}: {
  activeTab: string;
  students: Student[];
  lecturers: Lecturer[];
  courses: Course[];
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
  onEditStudent?: (s: Student) => void;
  onEditCourse?: (c: Course) => void;
  onEditLecturer?: (l: Lecturer) => void;
  onDeleteCourse?: (id: string) => void;
  onDeleteLecturer?: (id: string) => void;
  departments?: { id: string, name: string }[];
  createDepartment?: (name: string) => void;
  deleteDepartment?: (id: string) => void;
}) {
  const [newDepartmentName, setNewDepartmentName] = useState("");

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Students" value={students.length.toString()} change="+4 new this week" icon={Users} gradient="from-indigo-500 to-purple-500" />
          <StatCard label="Total Lecturers" value={lecturers.length.toString()} change="No change" icon={Award} gradient="from-purple-500 to-pink-500" />
          <StatCard label="Active Courses" value={courses.length.toString()} change="+1 newly added" icon={BookOpen} gradient="from-cyan-500 to-blue-500" />
          <StatCard label="Active Presentations" value={liveSessionId ? "1" : "0"} change={liveSessionId ? "LIVE" : "Inactive"} icon={Radio} gradient="from-rose-500 to-orange-500" />
          <StatCard label="AI Understanding Score" value="82%" change="↑ 3% since midterm" icon={Brain} gradient="from-emerald-500 to-teal-500" />
        </div>

        {/* Secondary overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Sessions Today</p>
            <h4 className="text-lg font-bold text-foreground">6 Sessions</h4>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Attendance Today</p>
            <h4 className="text-lg font-bold text-emerald-400">92.4%</h4>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Active Meetings</p>
            <h4 className="text-lg font-bold text-foreground">1 Session</h4>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Questions Today</p>
            <h4 className="text-lg font-bold text-primary">34 Asked</h4>
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
            {activityFeed.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">{activity.time}</span>
                <span className="text-foreground">{activity.text}</span>
              </div>
            ))}
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
            <option value="all">All Courses</option>
            <option value="CS401 Deep Learning">CS401 Deep Learning</option>
            <option value="CS301 Operating Systems">CS301 Operating Systems</option>
          </select>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Year</th>
                <th className="pb-3">Semester</th>
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
                    <td className="py-3 font-semibold">
                      <div className="flex items-center gap-2">
                        {student.name}
                        {student.isPending && <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Pending</span>}
                      </div>
                      {student.emp_id && <div className="text-[10px] text-muted-foreground mt-0.5">{student.emp_id}</div>}
                    </td>
                    <td className="py-3 text-muted-foreground">{student.email}</td>
                    <td className="py-3 text-muted-foreground">{student.department || 'General'}</td>
                    <td className="py-3 text-muted-foreground">{student.year || '1st Year'}</td>
                    <td className="py-3 text-muted-foreground">{student.semester || 'Semester 1'}</td>
                    <td className="py-3">{student.course}</td>
                    <td className="py-3">{student.lecturer}</td>
                    <td className="py-3 font-mono font-bold text-indigo-400">--</td>
                    <td className="py-3 font-mono">--</td>
                    <td className="py-3 font-mono">--</td>
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
                      <button onClick={() => onEditStudent && onEditStudent(student)} className="text-accent hover:underline font-bold cursor-pointer">Edit</button>
                      <button onClick={() => handleSuspendStudent(student.id)} className="text-amber-400 hover:underline font-bold cursor-pointer">Suspend</button>
                      <button onClick={() => handleDeleteStudent(student.id)} className="text-rose-400 hover:underline font-bold cursor-pointer"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                    </td>
                  </tr>
                ))}
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
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Assigned Courses</th>
                  <th className="pb-3">Subjects</th>
                  <th className="pb-3">Average Rating</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {lecturers.map(lec => (
                  <tr key={lec.id} className="group hover:bg-muted/10">
                    <td className="py-3 font-semibold">
                      <div className="flex items-center gap-2">
                        {lec.name}
                        {lec.isPending && <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Pending</span>}
                      </div>
                      {lec.emp_id && <div className="text-[10px] text-muted-foreground mt-0.5">{lec.emp_id}</div>}
                    </td>
                    <td className="py-3 text-muted-foreground">{lec.department || 'General'}</td>
                    <td className="py-3 text-muted-foreground">{lec.courses.join(", ")}</td>
                    <td className="py-3">{lec.subjects.join(", ")}</td>
                    <td className="py-3 font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                      --
                    </td>
                    <td className="py-3 text-right space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => alert("No coaching report available.")} className="text-primary hover:underline font-bold cursor-pointer">Coaching Report</button>
                      <button onClick={() => onEditLecturer && onEditLecturer(lec)} className="text-accent hover:underline font-bold cursor-pointer">Edit</button>
                      <button onClick={() => onDeleteLecturer && onDeleteLecturer(lec.id)} className="text-rose-400 hover:underline font-bold cursor-pointer"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lecturer Comparisons */}
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
            <div className="p-4 bg-muted/10 border border-border rounded-2xl flex flex-col justify-between text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-bold text-primary">{lecturers.find(l => l.id === compareLec1)?.name}</span>
                <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">{compareLec1}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span>Average Rating</span><span className="font-bold text-amber-400">-- / 5.0</span></div>
                <div className="flex justify-between"><span>Assigned Courses</span><span className="font-semibold">{lecturers.find(l => l.id === compareLec1)?.courses.join(", ")}</span></div>
                <div className="flex justify-between"><span>Core Subjects</span><span className="font-semibold">{lecturers.find(l => l.id === compareLec1)?.subjects.join(", ")}</span></div>
                <div className="flex justify-between"><span>Attendance Index</span><span className="font-bold text-emerald-400">--%</span></div>
              </div>
              <div className="p-2.5 bg-background border border-border rounded-xl text-[10px] leading-relaxed text-muted-foreground">
                <strong>Pace Coach AI:</strong> Not enough data to generate insights.
              </div>
            </div>

            <div className="p-4 bg-muted/10 border border-border rounded-2xl flex flex-col justify-between text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="font-bold text-secondary">{lecturers.find(l => l.id === compareLec2)?.name}</span>
                <span className="font-mono text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded">{compareLec2}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span>Average Rating</span><span className="font-bold text-amber-400">-- / 5.0</span></div>
                <div className="flex justify-between"><span>Assigned Courses</span><span className="font-semibold">{lecturers.find(l => l.id === compareLec2)?.courses.join(", ")}</span></div>
                <div className="flex justify-between"><span>Core Subjects</span><span className="font-semibold">{lecturers.find(l => l.id === compareLec2)?.subjects.join(", ")}</span></div>
                <div className="flex justify-between"><span>Attendance Index</span><span className="font-bold text-emerald-400">--%</span></div>
              </div>
              <div className="p-2.5 bg-background border border-border rounded-xl text-[10px] leading-relaxed text-muted-foreground">
                <strong>Pace Coach AI:</strong> Not enough data to generate insights.
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-muted-foreground text-[10px]">
            <p>Comparative radar chart will appear here once sufficient baseline data is collected.</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "courses") {
    // Group courses by Year and Semester
    const groupedCourses: Record<string, Course[]> = {};
    courses.forEach(course => {
      const key = `${course.year || '1st Year'} - ${course.semester || 'Semester 1'}`;
      if (!groupedCourses[key]) groupedCourses[key] = [];
      groupedCourses[key].push(course);
    });

    // Sort the keys so they appear in order
    const sortedGroupKeys = Object.keys(groupedCourses).sort();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">Course Catalog</h3>
            <p className="text-xs text-muted-foreground">Direct access to enrolled counts, averages and archives categorized by Year and Semester.</p>
          </div>
          <button onClick={() => setShowCreateCourse(true)} className="bg-primary text-white hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Create Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-3xl">
            <p>No courses available. Click "Create Course" to add one.</p>
          </div>
        ) : (
          sortedGroupKeys.map(groupKey => (
            <div key={groupKey} className="space-y-4">
              <h4 className="font-bold text-sm text-primary border-b border-border/50 pb-2">{groupKey}</h4>
              <div className="grid md:grid-cols-3 gap-6">
                {groupedCourses[groupKey].map(course => (
                  <div key={course.id} className="bg-muted/5 border border-border/50 rounded-2xl p-5 hover:border-border transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {course.code && <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{course.code}</div>}
                        <h4 className="font-bold text-foreground text-sm">{course.name}</h4>
                        <span className="text-[10px] text-muted-foreground">{course.department || 'General'} • {course.year} • {course.semester}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{course.studentsCount} Students</span>
                    </div>

                    <div className="space-y-2 border-t border-border/50 pt-3 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Lecturer:</span>
                        <span className="text-foreground font-semibold truncate max-w-[150px] text-right">{course.lecturer}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Avg Attendance:</span>
                        <span className="text-emerald-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Avg Engagement:</span>
                        <span className="text-indigo-400 font-bold">--</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subjects:</span>
                        <span className="text-foreground truncate max-w-[120px] text-right">{course.subjects.join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-border/30">
                      <button onClick={() => onEditCourse && onEditCourse(course)} className="bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer">Edit</button>
                      <button onClick={() => alert(`Course Archive: ${course.name}\n\nAll historical sessions have been processed.`)} className="bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer">Archive</button>
                      <button onClick={() => alert(`Analytics details:\n\nAttendance: ${course.attendance}%\nEngagement: ${course.engagement}%`)} className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer">Analytics</button>
                      <button onClick={() => onDeleteCourse && onDeleteCourse(course.id)} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (activeTab === "analytics") {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="font-bold text-foreground">Analytics Unavailable</h3>
          <p className="text-muted-foreground text-xs max-w-md mx-auto">
            Not enough data has been collected yet. As students attend sessions and interact with the platform, comprehensive analytics will appear here.
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === "departments") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">Manage Departments</h3>
            <p className="text-xs text-muted-foreground">Define the departments that exist within your faculty. These will be available in dropdowns when adding students, lecturers, or courses.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <input
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder="e.g. Computer Engineering"
              className="flex-1 bg-input border border-border px-4 py-2 text-xs rounded-xl outline-none"
            />
            <button
              onClick={() => {
                if (newDepartmentName.trim() && createDepartment) {
                  createDepartment(newDepartmentName.trim());
                  setNewDepartmentName("");
                }
              }}
              className="bg-primary text-white hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add Department
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {departments && departments.length > 0 ? (
              departments.map(dept => (
                <div key={dept.id} className="bg-muted/5 border border-border/50 rounded-2xl p-4 flex items-center justify-between hover:border-border transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-foreground truncate">{dept.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${dept.name}?`) && deleteDepartment) {
                        deleteDepartment(dept.id);
                      }
                    }} 
                    className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-xs text-muted-foreground bg-background border border-border/50 rounded-2xl">
                <Building className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No departments defined yet. Add one above.</p>
              </div>
            )}
          </div>
        </div>
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
