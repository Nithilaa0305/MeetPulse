import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Presentation, Eye, ThumbsDown, Clock } from "lucide-react";

interface Props {
  dateFilter: string;
}

const data = [
  { slide: "Slide 1", views: 100, confused: 5, avgTime: 30 },
  { slide: "Slide 2", views: 98, confused: 12, avgTime: 45 },
  { slide: "Slide 3 (Arch)", views: 95, confused: 45, avgTime: 120 },
  { slide: "Slide 4", views: 90, confused: 8, avgTime: 40 },
  { slide: "Slide 5", views: 88, confused: 20, avgTime: 85 },
];

export function SlideAnalyticsTab({ dateFilter }: Props) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Slides", value: "24", icon: Presentation, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Avg View Time", value: "45s", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Most Confusing", value: "Slide 3", icon: ThumbsDown, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Highest Re-views", value: "Slide 5", icon: Eye, color: "text-amber-500", bg: "bg-amber-500/10" },
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
        <h3 className="text-sm font-bold text-foreground mb-4">Slide Performance ({dateFilter})</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis dataKey="slide" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#cbd5e1" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#e2e8f0" }}
                cursor={{ fill: "#334155", opacity: 0.2 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="views" name="Views" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              <Bar dataKey="confused" name="Confusion Alerts" fill="#e11d48" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
