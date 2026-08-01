import React from "react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { UserCheck, Mic, Activity, Star } from "lucide-react";

interface Props {
  dateFilter: string;
}

const data = [
  { presentation: "Week 1", pace: 110, clarity: 85, rating: 4.2 },
  { presentation: "Week 2", pace: 125, clarity: 80, rating: 4.0 },
  { presentation: "Week 3", pace: 118, clarity: 92, rating: 4.8 },
  { presentation: "Week 4", pace: 120, clarity: 88, rating: 4.5 },
];

export function PresenterAnalyticsTab({ dateFilter }: Props) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "AI Presenter Rating", value: "4.5/5", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Avg Speaking Pace", value: "118 wpm", icon: Mic, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Presentation Clarity", value: "88%", icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Interaction Freq.", value: "Every 5m", icon: UserCheck, color: "text-indigo-500", bg: "bg-indigo-500/10" },
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
        <h3 className="text-sm font-bold text-foreground mb-4">Presenter Performance Trend ({dateFilter})</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="presentation" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Bar yAxisId="left" dataKey="clarity" name="Clarity Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="pace" name="Speaking Pace (wpm)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
