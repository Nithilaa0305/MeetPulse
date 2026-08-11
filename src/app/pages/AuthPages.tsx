import { useState } from "react";
import { AuthMode } from "../types";
import { GlowOrbs } from "../components/common/CommonUI";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/useAuthStore";

export function AuthPage({ 
  mode, 
  setMode, 
  onNext, 
  onForgotPassword,
  onDirectApp
}: { 
  mode: AuthMode; 
  setMode: (m: AuthMode) => void; 
  onNext: () => void; 
  onForgotPassword: () => void; 
  onDirectApp?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const updateUser = useAuthStore(state => state.updateUser);

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });
        if (signUpError) throw signUpError;
        
        if (data?.session) {
          // Auto logged in!
          onNext();
        } else {
          setSuccessMsg("Account created successfully! Check your inbox to verify your email, or try logging in.");
        }
      } else {
        const { error: signInError, data: authData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        
        if (authData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
          if (profile?.org_type && profile?.role && profile?.organization_name !== null) {
            onDirectApp ? onDirectApp() : onNext();
            return;
          }
        }
        
        onNext();
      }
    } catch (err: any) {
      const msg = err.message || (typeof err === 'string' ? err : JSON.stringify(err));
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowOrbs />
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 relative z-10 shadow-2xl">
        <h2 className="text-2xl font-bold mb-1 text-center">{mode === "register" ? "Create Account" : "Welcome Back"}</h2>
        <p className="text-xs text-muted-foreground text-center mb-6">Enter workspace parameters</p>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs p-3 rounded-xl mb-4 text-center font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 rounded-xl mb-4 text-center font-medium leading-relaxed">
            {successMsg}
          </div>
        )}

        <div className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-[11px] font-bold text-muted-foreground mb-1 block">FULL NAME</label>
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Sarah Chen" 
                className="w-full bg-input rounded-xl border border-border px-4 py-3 text-sm focus:border-primary/50 outline-none" 
              />
            </div>
          )}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1 block">WORK EMAIL</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@organization.edu" 
              className="w-full bg-input rounded-xl border border-border px-4 py-3 text-sm focus:border-primary/50 outline-none" 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-muted-foreground block">PASSWORD</label>
              {mode === "login" && (
                <button 
                  type="button" 
                  onClick={onForgotPassword} 
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">
                  Forgot Password?
                </button>
              )}
            </div>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-input rounded-xl border border-border px-4 py-3 text-sm focus:border-primary/50 outline-none" 
            />
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50">
            {loading ? "Processing..." : mode === "register" ? "Create Account & Continue" : "Log In & Continue"}
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          {mode === "register" ? "Already have an account? " : "No account? "}
          <button className="text-primary font-semibold hover:underline cursor-pointer" onClick={() => setMode(mode === "register" ? "login" : "register")}>
            {mode === "register" ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export function LoginPage({ onNext, onSignup, onForgotPassword, onDirectApp }: { onNext: () => void; onSignup: () => void; onForgotPassword: () => void; onDirectApp?: () => void }) {
  return (
    <AuthPage mode="login" setMode={() => onSignup()} onNext={onNext} onForgotPassword={onForgotPassword} onDirectApp={onDirectApp} />
  );
}

export function RegisterPage({ onNext, onLogin, onDirectApp }: { onNext: () => void; onLogin: () => void; onDirectApp?: () => void }) {
  return (
    <AuthPage mode="register" setMode={() => onLogin()} onNext={onNext} onForgotPassword={() => {}} onDirectApp={onDirectApp} />
  );
}
