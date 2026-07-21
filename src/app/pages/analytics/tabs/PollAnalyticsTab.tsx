import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { PieChart as PieIcon, CheckCircle, BarChart2, Activity } from "lucide-react";

interface Props {
  dateFilter: string;
}

const data = [
  { name: "Option A", value: 400 },
  { name: "Option B", value: 300 },
  { name: "Option C", value: 300 },
  { name: "Option D", value: 200 },
];
const COLORS = ["#4f46e5", "#3b82f6", "#06b6d4", "#10b981"];

export function PollAnalyticsTab({ dateFilter }: Props) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Polls", value: "15", icon: PieIcon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Avg Response Rate", value: "85%", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Total Votes", value: "1,240", icon: BarChart2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Avg Response Time", value: "15s", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
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
        <h3 className="text-sm font-bold text-foreground mb-4">Latest Poll Distribution ({dateFilter})</h3>
        <div className="flex-1 w-full min-h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
