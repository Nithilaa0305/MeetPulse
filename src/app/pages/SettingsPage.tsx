import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Zap, ShieldAlert, LogOut, KeyRound } from "lucide-react";
import { Role, OrgType } from "../types";
import { supabase } from "../../lib/supabase";

export function SettingsPage({
  currentUser,
  setCurrentUser,
  role,
  org,
  onLogout,
  onDeleteAccount
}: {
  currentUser: { name: string; email: string };
  setCurrentUser: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>;
  role: Role;
  org: OrgType;
  onLogout: () => void;
  onDeleteAccount: () => void;
}) {
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert("Password updated successfully!");
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-white">
                {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "MP"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">{currentUser.name}</h2>
                <span className="bg-primary/20 text-primary-foreground border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {role}
                </span>
              </div>
              <p className="text-xs text-indigo-300/80 mt-0.5">{currentUser.email}</p>
              <p className="text-[10px] text-slate-400 mt-1 capitalize">Organization: <span className="text-white font-semibold">{org}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onLogout} className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card border border-border rounded-3xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-foreground">Edit Account Credentials</h3>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!editName.trim() || !editEmail.trim()) return;
            setCurrentUser({ name: editName.trim(), email: editEmail.trim() });
            alert("Profile updated successfully!");
          }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                className="w-full bg-input border border-border px-4 py-3 text-xs rounded-xl outline-none focus:border-indigo-500 transition-all font-medium" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={editEmail} 
                onChange={e => setEditEmail(e.target.value)} 
                className="w-full bg-input border border-border px-4 py-3 text-xs rounded-xl outline-none focus:border-indigo-500 transition-all font-medium" 
              />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-card border border-border rounded-3xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-foreground">Security Settings</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Enter new password"
                className="w-full bg-input border border-border px-4 py-3 text-xs rounded-xl outline-none focus:border-indigo-500 transition-all font-medium" 
              />
              <p className="text-[10px] text-muted-foreground">Must be at least 6 characters long.</p>
            </div>
            
            <div className="flex justify-end pt-2">
              <button disabled={isChangingPassword} type="submit" className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer">
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Session & Privacy
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted/20 rounded-xl flex items-center justify-between">
                <span className="text-muted-foreground">Active Role</span>
                <span className="font-bold capitalize text-foreground">{role}</span>
              </div>
              <div className="p-3 bg-muted/20 rounded-xl flex items-center justify-between">
                <span className="text-muted-foreground">Workspace</span>
                <span className="font-bold capitalize text-foreground">{org}</span>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deleting your account is permanent. All associated AI diagnostic reports and meeting logs will be wiped.
            </p>
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                  onDeleteAccount();
                }
              }}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
