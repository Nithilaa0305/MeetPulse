import React from "react";
import { Building, TrendingUp, Radio, Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "../../components/common/CommonUI";
import { attendanceTrendData, SaaSUsageData } from "../../data/mockData";

export function SuperAdminDashboard({ activeTab }: { activeTab: string }) {
  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Organizations" value="530" change="+12% this month" icon={Building} gradient="from-indigo-500 to-purple-500" />
          <StatCard label="Monthly Recurring Revenue" value="$42,850" change="+$3,400 new subscriptions" icon={TrendingUp} gradient="from-emerald-500 to-teal-500" />
          <StatCard label="Active Live Sessions" value="28" change="247 total users live" icon={Radio} gradient="from-rose-500 to-pink-500" />
          <StatCard label="API Server Load" value="28.4 ms" change="Healthy" icon={Activity} gradient="from-cyan-500 to-blue-500" />
        </div>

        {/* Recharts Pie & Revenue */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6">
            <h3 className="font-bold text-sm mb-4">SaaS Platform Growth & Traffic</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="attendance" name="Active Orgs" stroke="#6366F1" fill="rgba(99,102,241,0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm mb-4">Organization Types</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={SaaSUsageData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      {SaaSUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-2">
              {SaaSUsageData.map(item => (
                <div key={item.name} className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.name}</span>
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "organizations") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-sm">Active Organizations Directory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3">Org Name</th>
                <th className="pb-3">Domain</th>
                <th className="pb-3">Subscribers</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-3 font-semibold">Stanford University</td>
                <td className="py-3">stanford.edu</td>
                <td className="py-3">12,400 Users</td>
                <td className="py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">Active</span></td>
                <td className="py-3 font-bold text-primary">Enterprise</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Stripe Corporate</td>
                <td className="py-3">stripe.com</td>
                <td className="py-3">4,800 Employees</td>
                <td className="py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">Active</span></td>
                <td className="py-3 font-bold text-primary">Enterprise</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">MIT CS Department</td>
                <td className="py-3">mit.edu</td>
                <td className="py-3">8,200 Students</td>
                <td className="py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">Active</span></td>
                <td className="py-3 font-bold text-indigo-400">Pro Edu</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-muted-foreground border border-border rounded-3xl bg-card">
      <h3 className="font-bold text-base text-foreground mb-1">SaaS Management - {activeTab}</h3>
      <p className="text-xs">Sub-system portal active.</p>
    </div>
  );
}
