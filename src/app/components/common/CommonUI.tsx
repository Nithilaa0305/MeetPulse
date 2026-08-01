import React from "react";

export function GlowOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] translate-x-1/3 translate-y-1/3" />
    </div>
  );
}

export function StatCard({ label, value, change, icon: Icon, gradient }: {
  label: string; value: string; change?: string; icon: React.ElementType; gradient: string;
}) {
  return (
    <div className="bg-card/80 backdrop-blur-md border border-border/70 hover:border-indigo-500/40 rounded-3xl p-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
            change.startsWith("+") || change.includes("↑") || change.toLowerCase().includes("healthy") || change.toLowerCase().includes("live")
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
              : "bg-muted/60 text-muted-foreground border-border/50"
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-black tracking-tight text-foreground mb-1 relative z-10">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground relative z-10">{label}</p>
    </div>
  );
}
