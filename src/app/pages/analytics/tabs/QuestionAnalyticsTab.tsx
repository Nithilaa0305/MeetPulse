import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { MessageSquare, MessageCircle, HelpCircle, EyeOff } from "lucide-react";

interface Props {
  dateFilter: string;
}

const data = [
  { time: "0-10m", total: 5, answered: 3, pending: 2 },
  { time: "10-20m", total: 12, answered: 8, pending: 4 },
  { time: "20-30m", total: 25, answered: 15, pending: 10 },
  { time: "30-40m", total: 18, answered: 16, pending: 2 },
];

export function QuestionAnalyticsTab({ dateFilter }: Props) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Questions", value: "60", icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Answered", value: "42", icon: MessageCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Pending", value: "18", icon: HelpCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Anonymous Qs", value: "45%", icon: EyeOff, color: "text-slate-500", bg: "bg-slate-500/10" },
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
        <h3 className="text-sm font-bold text-foreground mb-4">Question Timeline ({dateFilter})</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="total" name="Total Questions" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="answered" name="Answered" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
