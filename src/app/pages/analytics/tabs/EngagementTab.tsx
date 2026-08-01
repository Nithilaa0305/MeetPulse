import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Zap, ThumbsUp, HelpCircle, Hand } from "lucide-react";

interface Props {
  dateFilter: string;
}

const data = [
  { time: "0-10m", reactions: 120, questions: 5, raisedHands: 2 },
  { time: "10-20m", reactions: 85, questions: 12, raisedHands: 5 },
  { time: "20-30m", reactions: 210, questions: 25, raisedHands: 8 },
  { time: "30-40m", reactions: 150, questions: 18, raisedHands: 4 },
];

export function EngagementTab({ dateFilter }: Props) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Engagement Score", value: "92/100", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Total Reactions", value: "565", icon: ThumbsUp, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Questions Asked", value: "60", icon: HelpCircle, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Raised Hands", value: "19", icon: Hand, color: "text-purple-500", bg: "bg-purple-500/10" },
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
        <h3 className="text-sm font-bold text-foreground mb-4">Engagement Timeline ({dateFilter})</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#e2e8f0" }}
                cursor={{ fill: "#334155", opacity: 0.2 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="reactions" name="Reactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="questions" name="Questions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="raisedHands" name="Raised Hands" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
