import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { Brain, Target, BookOpen, AlertTriangle } from "lucide-react";

interface Props {
  dateFilter: string;
}

const data = [
  { subject: "Concepts", A: 90, B: 80, fullMark: 100 },
  { subject: "Application", A: 85, B: 75, fullMark: 100 },
  { subject: "Retention", A: 78, B: 70, fullMark: 100 },
  { subject: "Clarity", A: 95, B: 85, fullMark: 100 },
  { subject: "Participation", A: 88, B: 72, fullMark: 100 },
];

export function UnderstandingTab({ dateFilter }: Props) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "AI Underst. Score", value: "88%", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Quiz Accuracy", value: "82%", icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Knowledge Retention", value: "78%", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Confusing Topics", value: "3", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
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
        <h3 className="text-sm font-bold text-foreground mb-4">Understanding Radar ({dateFilter})</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
              <Radar name="Current Period" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
              <Radar name="Previous Period" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", fontSize: "12px" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
