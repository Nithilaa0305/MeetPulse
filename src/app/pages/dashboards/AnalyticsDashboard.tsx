import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import {
  Download, Calendar, Users, Target, Activity, Brain, CheckSquare, MessageSquare, Mic, Lightbulb, Clock, Building, Sparkles
} from "lucide-react";

import { useDataStore } from "../../../store/useDataStore";

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

function MetricCard({ title, value, change, icon: Icon, color }: { title: string, value: string | number, change: string, icon: any, color: string }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-${color}-500/10`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-400`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${change.startsWith('+') || change.startsWith('↑') ? 'bg-emerald-500/10 text-emerald-400' : change.startsWith('-') || change.startsWith('↓') ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
          {change}
        </span>
      </div>
      <div className="relative z-10">
        <h4 className="text-2xl font-extrabold text-foreground mb-1">{value}</h4>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ role, org }: { role: string; org: string }) {
  const { sessions } = useDataStore();
  const [activeTab, setActiveTab] = useState("attendance");
  const [dateRange, setDateRange] = useState("All Time");
  const [courseFilter, setCourseFilter] = useState("All Courses");

  const tabs = [
    { id: "attendance", label: "Attendance", icon: Users, color: "indigo" },
    { id: "engagement", label: "Engagement", icon: Activity, color: "rose" },
    { id: "understanding", label: "Understanding", icon: Brain, color: "emerald" },
    { id: "polls", label: "Polls", icon: CheckSquare, color: "purple" },
    { id: "questions", label: "Questions", icon: MessageSquare, color: "amber" },
    { id: "ai", label: "AI Insights", icon: Lightbulb, color: "pink" }
  ];

  // Process data from store
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(s => s.status === 'ended' && s.analytics && Object.keys(s.analytics).length > 0);
    
    // Course Filter
    if (courseFilter !== "All Courses") {
      filtered = filtered.filter(s => s.course === courseFilter);
    }

    // Date Filter
    if (dateRange !== "All Time") {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === "Today") cutoff.setDate(now.getDate() - 1);
      if (dateRange === "Last 7 Days") cutoff.setDate(now.getDate() - 7);
      if (dateRange === "Last 30 Days") cutoff.setDate(now.getDate() - 30);
      
      filtered = filtered.filter(s => new Date(s.date) >= cutoff);
    }

    // Sort by date ascending
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, dateRange, courseFilter]);

  const uniqueCourses = ["All Courses", ...Array.from(new Set(sessions.map(s => s.course)))];

  // Calculate Aggregates
  const totalSessions = filteredSessions.length;
  const avgAttendance = totalSessions ? Math.round(filteredSessions.reduce((acc, s) => acc + (s.analytics?.audienceCount || 0), 0) / totalSessions) : 0;
  const avgPulse = totalSessions ? Math.round(filteredSessions.reduce((acc, s) => acc + (s.analytics?.pulseScore || 0), 0) / totalSessions) : 0;
  const totalQuestions = filteredSessions.reduce((acc, s) => acc + (s.analytics?.liveQuestions?.length || 0), 0);
  const totalReactions = filteredSessions.reduce((acc, s) => acc + (s.analytics?.liveReactions?.length || 0), 0);

  // Time Series Data
  const trendData = filteredSessions.map(s => {
    const qCount = s.analytics?.liveQuestions?.length || 0;
    const answeredCount = s.analytics?.liveQuestions?.filter((q:any) => q.isAnswered)?.length || 0;
    
    return {
      name: s.name,
      date: s.date,
      attendance: s.analytics?.audienceCount || 0,
      engagement: s.analytics?.pulseScore || 0,
      reactions: s.analytics?.liveReactions?.length || 0,
      questions: qCount,
      answerRate: qCount ? Math.round((answeredCount / qCount) * 100) : 0,
      polls: s.analytics?.livePoll ? 1 : 0
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-3xl">
        <div>
          <h2 className="text-xl font-bold text-foreground">Global Analytics Center</h2>
          <p className="text-xs text-muted-foreground">Historical aggregated insights from all concluded meetings.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={courseFilter} 
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-background border border-border px-4 py-2 rounded-xl text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer">
            {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-background border border-border px-4 py-2 rounded-xl text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
          <button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isActive 
                  ? `bg-${tab.color}-500 text-white border-${tab.color}-400 shadow-md shadow-${tab.color}-500/25`
                  : `bg-card border-border text-muted-foreground hover:bg-muted`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* NO DATA STATE */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl space-y-4">
          <Activity className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
          <h4 className="font-bold text-sm">No Historical Data Found</h4>
          <p className="text-xs text-muted-foreground">No sessions match your current filters. End a live session first to generate historical data.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "attendance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard title="Avg Attendance" value={avgAttendance} change="Active" icon={Users} color="indigo" />
                  <MetricCard title="Total Sessions" value={totalSessions} change="Completed" icon={Calendar} color="blue" />
                </div>
                <div className="bg-card border border-border p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-6">Audience Growth Timeline</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="attendance" name="Audience Count" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "engagement" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard title="Avg Engagement Pulse" value={`${avgPulse}%`} change="Avg" icon={Activity} color="rose" />
                  <MetricCard title="Total Reactions" value={totalReactions} change="Global" icon={Users} color="rose" />
                </div>
                <div className="bg-card border border-border p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-6">Historical Session Engagement</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="engagement" name="Pulse Score" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="reactions" name="Reactions" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "understanding" && (
              <div className="space-y-6">
                <div className="bg-card border border-border p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-6">Answer Rate by Session</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                        <Bar dataKey="answerRate" name="Answer Rate (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "questions" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard title="Total Questions Asked" value={totalQuestions} change="All time" icon={MessageSquare} color="amber" />
                </div>
                <div className="bg-card border border-border p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-6">Questions Volume Over Time</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="questions" name="Total Questions" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "polls" && (
              <div className="space-y-6">
                <div className="bg-card border border-border p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-6">Poll Usage Across Sessions</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <RechartsTooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                        <Bar dataKey="polls" name="Polls Launched" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-6">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-indigo-400">AI Predictive Insights</h3>
                      <p className="text-xs text-indigo-300/70">Generated autonomously based on {totalSessions} historical sessions.</p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <div className="bg-background/50 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground">Engagement Status</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">Average pulse score is {avgPulse}%. This is a strong indicator of steady class involvement.</p>
                      </div>
                    </div>
                    <div className="bg-background/50 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground">Question Distribution</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">Across all sessions, you have received {totalQuestions} total questions. Consider dedicating a strict 5 minute Q&A segment at the end of classes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
