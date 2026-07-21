import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Building2, Users, Layers, Trophy } from "lucide-react";

interface Props {
  dateFilter: string;
}

const data = [
  { department: "Engineering", meetings: 120, engagement: 92 },
  { department: "Sales", meetings: 85, engagement: 88 },
  { department: "Marketing", meetings: 65, engagement: 85 },
  { department: "HR", meetings: 40, engagement: 95 },
  { department: "Product", meetings: 95, engagement: 90 },
];

export function OrganizationAnalyticsTab({ dateFilter }: Props) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Meetings", value: "405", icon: Building2, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Active Users", value: "1,240", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Depts", value: "12", icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Top Dept", value: "Engineering", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">{kpi.label}</p>
              <h3 className="text-xl font-extrabold text-foreground">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-card border border-border rounded-2xl p-5 shadow-sm min-h-[300px] flex flex-col">
        <h3 className="text-sm font-bold text-foreground mb-4">Department Performance ({dateFilter})</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#e2e8f0" }}
                cursor={{ fill: "#334155", opacity: 0.2 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Bar yAxisId="left" dataKey="meetings" name="Total Meetings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="engagement" name="Avg Engagement Score" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
