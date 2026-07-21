import { OrgType, Role } from "../types";
import { GlowOrbs } from "../components/common/CommonUI";
import { GraduationCap, Briefcase, Building, Mic, Users } from "lucide-react";

export function OrgSelectPage({ onSelect }: { onSelect: (o: OrgType) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowOrbs />
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-8 relative z-10 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-1">Select Workspace Model</h2>
        <p className="text-xs text-muted-foreground text-center mb-8">Tailor dashboards to academic or corporate workflows</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={() => onSelect("education")} className="bg-background hover:border-primary/40 border border-border rounded-2xl p-6 text-left transition-all hover:scale-[1.02] group cursor-pointer">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-all mb-4"><GraduationCap className="w-6 h-6" /></div>
            <h3 className="font-bold text-base mb-1">Education Workspaces</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Universities, schools, courses, lecturers, student directories, academic sessions, and coaching feedback.</p>
          </button>
          <button onClick={() => onSelect("business")} className="bg-background hover:border-primary/40 border border-border rounded-2xl p-6 text-left transition-all hover:scale-[1.02] group cursor-pointer">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-all mb-4"><Briefcase className="w-6 h-6" /></div>
            <h3 className="font-bold text-base mb-1">Business & Enterprise</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Teams, managers, corporate meetings, employees, task completion boards, and action minutes.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoleSelectPage({ org, onSelect }: { org: OrgType; onSelect: (r: Role) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowOrbs />
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-8 relative z-10 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-1">Choose Dashboard Role</h2>
        <p className="text-xs text-muted-foreground text-center mb-8 uppercase tracking-widest font-semibold text-primary">Workspace: {org}</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <button onClick={() => onSelect("admin")} className="bg-background border border-border hover:border-primary rounded-2xl p-5 text-center transition-all group cursor-pointer">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3"><Building className="w-5 h-5" /></div>
            <h4 className="font-bold text-sm mb-1">Administrator</h4>
            <p className="text-[11px] text-muted-foreground">Manage courses, users, analytics summaries.</p>
          </button>
          <button onClick={() => onSelect("presenter")} className="bg-background border border-border hover:border-primary rounded-2xl p-5 text-center transition-all group cursor-pointer">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3"><Mic className="w-5 h-5" /></div>
            <h4 className="font-bold text-sm mb-1">{org === "education" ? "Professor / Lecturer" : "Meeting Leader"}</h4>
            <p className="text-[11px] text-muted-foreground">Start presentation, sync slides, launch polls.</p>
          </button>
          <button onClick={() => onSelect("participant")} className="bg-background border border-border hover:border-primary rounded-2xl p-5 text-center transition-all group cursor-pointer">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3"><Users className="w-5 h-5" /></div>
            <h4 className="font-bold text-sm mb-1">{org === "education" ? "Student" : "Employee"}</h4>
            <p className="text-[11px] text-muted-foreground">Join session, write notes, react live.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailsPage({ org, role, onNext }: { org: OrgType; role: Role; onNext: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowOrbs />
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 relative z-10 shadow-2xl">
        <h2 className="text-2xl font-bold mb-1 text-center">Complete Profile</h2>
        <p className="text-xs text-muted-foreground text-center mb-6">Enter metadata parameters</p>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1 block">ORGANIZATION NAME</label>
            <input placeholder={org === "education" ? "Stanford University" : "Stripe Inc."} className="w-full bg-input rounded-xl border border-border px-4 py-3 text-sm focus:border-primary/50 outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1 block">DEPARTMENT</label>
            <input placeholder="Computer Science" className="w-full bg-input rounded-xl border border-border px-4 py-3 text-sm focus:border-primary/50 outline-none" />
          </div>
          <button onClick={onNext} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer">
            Enter Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
