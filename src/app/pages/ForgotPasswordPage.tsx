import { useState } from "react";
import { GlowOrbs } from "../components/common/CommonUI";
import { Sparkles, ArrowLeft, Mail, Check } from "lucide-react";

export function ForgotPasswordPage({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowOrbs />
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 relative z-10 shadow-2xl space-y-6">
        <button 
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Log in
        </button>

        {!submitted ? (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground">Reset Password</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your work email address and we will send you an official link to reset your account password.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              setSubmitted(true);
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">WORK EMAIL</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="you@organization.edu" 
                    className="w-full bg-input rounded-xl border border-border pl-10 pr-4 py-3 text-sm focus:border-primary/50 outline-none" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                Send Recovery Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Recovery Link Sent!</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. Check your inbox and follow the instructions.
            </p>
            <button 
              onClick={onBackToLogin}
              className="w-full bg-muted/20 hover:bg-muted/30 text-foreground py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer">
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
