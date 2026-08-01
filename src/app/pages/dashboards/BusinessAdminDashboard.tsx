import React from "react";
import { Users, Building, MessageSquare, Activity, CheckSquare, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { StatCard } from "../../components/common/CommonUI";
import { Employee } from "../../types";
import { attendanceTrendData } from "../../data/mockData";

export function BusinessAdminDashboard({
  activeTab,
  employees,
  activityFeed,
  setShowEmployeeModal
}: {
  activeTab: string;
  employees: Employee[];
  activityFeed: { time: string; text: string }[];
  setShowEmployeeModal: (b: boolean) => void;
}) {
  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Employees" value={employees.length.toString()} change="+2 active now" icon={Users} gradient="from-blue-500 to-cyan-500" />
          <StatCard label="Total Departments" value="5" change="Optimal" icon={Building} gradient="from-indigo-500 to-purple-500" />
          <StatCard label="Meetings Today" value="4 Meetings" change="2 completed" icon={MessageSquare} gradient="from-purple-500 to-pink-500" />
          <StatCard label="Avg Engagement" value="81.4%" change="Stable productivity" icon={Activity} gradient="from-rose-500 to-orange-500" />
          <StatCard label="Completion Rate" value="94.2%" change="↑ 1.8% vs last week" icon={CheckSquare} gradient="from-emerald-500 to-teal-500" />
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm">Corporate Meeting Summary Feed</h3>
          <div className="space-y-3 text-xs">
            {activityFeed.slice(0, 3).map((act, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-background border border-border rounded-xl">
                <span>{act.text}</span>
                <span className="text-[10px] text-muted-foreground">{act.time}</span>
              </div>
            ))}
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
                  <td className="py-3">{emp.dept}</td>
                  <td className="py-3 text-muted-foreground">{emp.manager}</td>
                  <td className="py-3 font-mono">{emp.meetings}</td>
                  <td className="py-3 font-mono font-bold text-indigo-400">{emp.eng}%</td>
                  <td className="py-3 font-mono">{emp.tasks}</td>
                </tr>
              ))}
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
            <h4 className="text-xl font-bold">184 Meetings</h4>
          </div>
          <div className="p-4 bg-muted/10 border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground">Action items Generated</p>
            <h4 className="text-xl font-bold">47 Items</h4>
          </div>
          <div className="p-4 bg-muted/10 border border-border rounded-2xl text-center">
            <p className="text-xs text-muted-foreground">Participation Index</p>
            <h4 className="text-xl font-bold text-emerald-400">82.4%</h4>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="engagement" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Engagement" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
