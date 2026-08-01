import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import {
  Download, Calendar, Users, Target, Activity, Brain, Monitor, CheckSquare, MessageSquare, Mic, Lightbulb, Clock, Building
} from "lucide-react";

import {
  attendanceTimeline, engagementTrends, understandingRadar, slideHeatmap,
  pollDistribution, questionTimeline, presenterMetrics, organizationUsage, aiRecommendations
} from "../../data/analyticsMockData";

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

function MetricCard({ title, value, change, icon: Icon, color }: { title: string, value: string, change: string, icon: any, color: string }) {
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
  const [activeTab, setActiveTab] = useState("attendance");
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const tabs = [
    { id: "attendance", label: "Attendance", icon: Users, color: "indigo" },
    { id: "engagement", label: "Engagement", icon: Activity, color: "rose" },
    { id: "understanding", label: "Understanding", icon: Brain, color: "emerald" },
    { id: "slides", label: "Slide Analytics", icon: Monitor, color: "blue" },
    { id: "polls", label: "Polls", icon: CheckSquare, color: "purple" },
    { id: "questions", label: "Questions", icon: MessageSquare, color: "amber" },
    { id: "presenter", label: "Presenter", icon: Mic, color: "cyan" },
    { id: "ai", label: "AI Insights", icon: Lightbulb, color: "pink" },
    { id: "performance", label: "Performance", icon: Clock, color: "teal" },
    { id: "organization", label: "Organization", icon: Building, color: "indigo" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-3xl">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics Center</h2>
          <p className="text-xs text-muted-foreground">Comprehensive insights for {org === "education" ? "Institution" : "Organization"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-background border border-border px-4 py-2 rounded-xl text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
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

      {/* TAB CONTENT (with AnimatePresence for smooth transitions) */}
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
                <MetricCard title="Attendance Rate" value="92.4%" change="↑ 2.1%" icon={Users} color="indigo" />
                <MetricCard title="Avg Duration" value="54m" change="↑ 4m" icon={Clock} color="indigo" />
                <MetricCard title="Late Joins" value="12%" change="↓ 1.5%" icon={Target} color="rose" />
                <MetricCard title="Early Leaves" value="4%" change="No change" icon={Activity} color="slate" />
              </div>
              <div className="bg-card border border-border p-6 rounded-3xl">
                <h3 className="text-sm font-bold mb-6">Attendance Timeline (Today)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceTimeline}>
                      <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="attendance" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "engagement" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Engagement Score" value="88/100" change="↑ 5 pts" icon={Activity} color="rose" />
                <MetricCard title="Total Reactions" value="1,240" change="↑ 12%" icon={Users} color="rose" />
                <MetricCard title="Poll Response Rate" value="76%" change="↓ 2%" icon={CheckSquare} color="amber" />
                <MetricCard title="Questions Asked" value="84" change="↑ 14" icon={MessageSquare} color="blue" />
              </div>
              <div className="bg-card border border-border p-6 rounded-3xl">
                <h3 className="text-sm font-bold mb-6">Engagement Multi-Trend</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="reactions" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4 }} name="Reactions" />
                      <Line yAxisId="right" type="monotone" dataKey="questions" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Questions" />
                      <Line yAxisId="right" type="monotone" dataKey="polls" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Polls" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "understanding" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-2">AI Knowledge Retention</h3>
                  <p className="text-xs text-muted-foreground mb-6">Based on quiz responses and AI pulse checks.</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={understandingRadar}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Radar name="Score" dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-3xl flex flex-col justify-center">
                  <h3 className="text-sm font-bold mb-6 text-center">Global Understanding Score</h3>
                  <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="552.9" strokeDashoffset="55.29" className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-5xl font-extrabold text-foreground tracking-tighter">90<span className="text-2xl text-muted-foreground">%</span></span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Excellent</span>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-8">Highest retention in <strong className="text-foreground">Syntax</strong>. Weakest in <strong className="text-foreground">Architecture</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "slides" && (
            <div className="space-y-6">
              <div className="bg-card border border-border p-6 rounded-3xl">
                <h3 className="text-sm font-bold mb-6">Slide Interaction Heatmap</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slideHeatmap} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                      <XAxis type="number" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis dataKey="slide" type="category" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Bar dataKey="timeSpent" name="Time Spent (s)" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="confusion" name="Confusion Alerts" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="dropoff" name="Drop-offs" fill="#EF4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "polls" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-6">Latest Poll Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pollDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {pollDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {pollDistribution.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                        {entry.name} ({entry.value})
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-3xl flex flex-col justify-center text-center">
                  <h3 className="text-sm font-bold mb-8">Poll Performance</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-3xl font-extrabold text-foreground">8.2s</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Avg Response Time</p>
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-foreground">94%</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Completion Rate</p>
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-primary">12</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Total Polls Launched</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-6">
              <div className="bg-card border border-border p-6 rounded-3xl">
                <h3 className="text-sm font-bold mb-6">Questions per Slide</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="slide" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Bar dataKey="named" name="Named Questions" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="anon" name="Anonymous Questions" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "presenter" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {presenterMetrics.map((m, i) => (
                  <div key={i} className="bg-card border border-border p-5 rounded-3xl text-center relative overflow-hidden">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{m.name}</div>
                    <div className="text-3xl font-extrabold text-foreground mb-1">{m.value}</div>
                    <div className="text-[10px] text-cyan-400">Target: {m.optimal}</div>
                  </div>
                ))}
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
                    <h3 className="text-base font-bold text-indigo-400">AI Session Insights</h3>
                    <p className="text-xs text-indigo-300/70">Generated autonomously based on audience data.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="bg-background/50 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="bg-card border border-border p-6 rounded-3xl">
                <h3 className="text-sm font-bold mb-6">Meeting Performance Summary</h3>
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                  <Award className="w-16 h-16 text-teal-500 opacity-50 mb-4" />
                  <h4 className="text-2xl font-bold text-foreground">Top 10% Performing Meeting</h4>
                  <p className="text-sm text-muted-foreground max-w-md">Your recent sessions have shown exceptionally high completion rates and interaction frequencies compared to the organizational average.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "organization" && (
            <div className="space-y-6">
              <div className="bg-card border border-border p-6 rounded-3xl">
                <h3 className="text-sm font-bold mb-6">Department Active Users</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={organizationUsage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="month" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="engineering" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Engineering" />
                      <Line type="monotone" dataKey="sales" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} name="Sales" />
                      <Line type="monotone" dataKey="marketing" stroke="#EC4899" strokeWidth={3} dot={{ r: 4 }} name="Marketing" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
