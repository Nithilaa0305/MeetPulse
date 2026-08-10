import React from "react";
import { Users, Building, MessageSquare, Activity, CheckSquare, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { StatCard } from "../../components/common/CommonUI";
import { Employee, Session } from "../../types";

export function BusinessAdminDashboard({
  activeTab,
  employees,
  sessions,
  activityFeed,
  setShowEmployeeModal
}: {
  activeTab: string;
  employees: Employee[];
  sessions: Session[];
  activityFeed: { time: string; text: string }[];
  setShowEmployeeModal: (b: boolean) => void;
}) {
  // ── Derived stats from real data ────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  const thisMonthStr = thisMonthStart.toISOString().split("T")[0];

  const totalDepartments = new Set(employees.map(e => e.dept).filter(Boolean)).size;

  const avgEngagement = employees.length > 0
    ? (employees.reduce((acc, e) => acc + (e.eng || 0), 0) / employees.length).toFixed(1)
    : "0.0";

  const todaysSessions = sessions.filter(s => s.date === today);
  const completedToday = sessions.filter(s => s.date === today && s.status === "ended");
  const meetingsThisMonth = sessions.filter(s => s.date >= thisMonthStr).length;

  // Participation index: avg pulseScore across ended sessions this month
  const endedThisMonth = sessions.filter(s => s.date >= thisMonthStr && s.status === "ended" && s.analytics);
  const participationIndex = endedThisMonth.length > 0
    ? (endedThisMonth.reduce((acc, s) => acc + (s.analytics?.pulseScore || 0), 0) / endedThisMonth.length).toFixed(1)
    : null;

  // Monthly chart data from real sessions
  const monthlyData = React.useMemo(() => {
    const monthMap: Record<string, { engagement: number; count: number }> = {};
    sessions.forEach(s => {
      if (!s.date) return;
      const d = new Date(s.date);
      const key = d.toLocaleString("default", { month: "short" });
      if (!monthMap[key]) monthMap[key] = { engagement: 0, count: 0 };
      monthMap[key].engagement += s.analytics?.pulseScore || 0;
      monthMap[key].count += 1;
    });
    return Object.entries(monthMap)
      .map(([month, v]) => ({
        month,
        engagement: v.count > 0 ? Math.round(v.engagement / v.count) : 0,
      }))
      .slice(-6);
  }, [sessions]);

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Employees" value={employees.length.toString()} change={employees.length > 0 ? "Active members" : "No employees yet"} icon={Users} gradient="from-blue-500 to-cyan-500" />
          <StatCard label="Total Departments" value={totalDepartments > 0 ? totalDepartments.toString() : "—"} change={totalDepartments > 0 ? "Across organisation" : "No departments yet"} icon={Building} gradient="from-indigo-500 to-purple-500" />
          <StatCard label="Meetings Today" value={todaysSessions.length > 0 ? `${todaysSessions.length}` : "—"} change={completedToday.length > 0 ? `${completedToday.length} completed` : "None completed yet"} icon={MessageSquare} gradient="from-purple-500 to-pink-500" />
          <StatCard label="Avg Engagement" value={parseFloat(avgEngagement) > 0 ? `${avgEngagement}%` : "—"} change={employees.length > 0 ? "Across all employees" : "No data"} icon={Activity} gradient="from-rose-500 to-orange-500" />
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm">Corporate Meeting Summary Feed</h3>
          <div className="space-y-3 text-xs">
            {activityFeed.length > 0 ? activityFeed.slice(0, 3).map((act, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-background border border-border rounded-xl">
                <span>{act.text}</span>
                <span className="text-[10px] text-muted-foreground">{act.time}</span>
              </div>
            )) : (
              <p className="text-center py-4 text-muted-foreground">No activity yet. Start a live session to see real-time logs.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "employees") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">Employee Directory</h3>
            <p className="text-xs text-muted-foreground">Invite employees, assign departments, and configure manager roles.</p>
          </div>
          <button onClick={() => setShowEmployeeModal(true)} className="bg-primary text-white hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Invite Employee
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold">
                <th className="pb-3">Employee Name</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Manager</th>
                <th className="pb-3">Meetings Attended</th>
                <th className="pb-3">Engagement Score</th>
                <th className="pb-3">Tasks Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {employees.map(emp => (
                <tr key={emp.name}>
                  <td className="py-3 font-semibold">{emp.name}</td>
                  <td className="py-3">{emp.dept || "—"}</td>
                  <td className="py-3 text-muted-foreground">{emp.manager || "—"}</td>
                  <td className="py-3 font-mono">{emp.meetings}</td>
                  <td className="py-3 font-mono font-bold text-indigo-400">{emp.eng}%</td>
                  <td className="py-3 font-mono">{emp.tasks}</td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                    No employees yet. Invite employees to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === "analytics") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
        <h3 className="font-bold text-sm">Meeting Productivity Metrics</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-4 bg-muted/10 border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground">Meetings This Month</p>
            <h4 className="text-xl font-bold">{meetingsThisMonth > 0 ? `${meetingsThisMonth} Meeting${meetingsThisMonth !== 1 ? "s" : ""}` : "—"}</h4>
          </div>
          <div className="p-4 bg-muted/10 border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground">Avg Employee Engagement</p>
            <h4 className={`text-xl font-bold ${parseFloat(avgEngagement) > 0 ? "" : "text-muted-foreground"}`}>
              {parseFloat(avgEngagement) > 0 ? `${avgEngagement}%` : "—"}
            </h4>
          </div>
          <div className="p-4 bg-muted/10 border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground">Participation Index</p>
            <h4 className={`text-xl font-bold ${participationIndex ? "text-emerald-400" : "text-muted-foreground"}`}>
              {participationIndex ? `${participationIndex}%` : "—"}
            </h4>
          </div>
        </div>

        {monthlyData.length > 0 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Avg Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 flex items-center justify-center text-xs text-muted-foreground border border-border rounded-2xl">
            <div className="text-center space-y-2">
              <Activity className="w-8 h-8 mx-auto opacity-30" />
              <p>No session data yet. End meetings to generate analytics.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-3xl space-y-3">
      <p className="font-bold text-foreground">Welcome to Business Admin Workspace</p>
      <p>Select a tab from the sidebar to begin.</p>
    </div>
  );
}
