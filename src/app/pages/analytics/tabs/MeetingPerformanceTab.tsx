import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Clock, CheckCircle2, TrendingDown, Maximize } from "lucide-react";

interface Props {
  dateFilter: string;
}

const data = [
  { time: "0m", retention: 100 },
  { time: "15m", retention: 98 },
  { time: "30m", retention: 95 },
  { time: "45m", retention: 85 },
  { time: "60m", retention: 70 },
];

export function MeetingPerformanceTab({ dateFilter }: Props) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Duration", value: "52m", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completion Rate", value: "85%", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Peak Attendance", value: "142", icon: Maximize, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Avg Drop-off", value: "15%", icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-500/10" },
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
        <h3 className="text-sm font-bold text-foreground mb-4">Participant Retention Curve ({dateFilter})</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="retention" name="Retention %" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRetention)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
