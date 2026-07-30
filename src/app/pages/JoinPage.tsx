import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GlowOrbs } from "../components/common/CommonUI";
import { Sparkles, ArrowLeft, User, LogIn, Lock } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useMeetingStore } from "../../store/useMeetingStore";
import { useDataStore } from "../../store/useDataStore";

export function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const meetingId = searchParams.get("meetingId") || "";

  const { setUser, setRole, setOrg } = useAuthStore();
  const { setLiveSessionId, setAudienceCount } = useMeetingStore();
  const { sessions } = useDataStore();

  const [guestName, setGuestName] = useState("");
  const [session, setSession] = useState<any>(null);

  // Find the session matching the meetingId
  useEffect(() => {
    if (meetingId) {
      const foundSession = sessions.find((s) => s.meetingId === meetingId);
      if (foundSession) {
        setSession(foundSession);
      } else {
        // Fallback mockup session if not found in store
        setSession({
          id: "SESS-MOCK",
          name: "CS401 Deep Learning Lecture",
          course: "CS401 Deep Learning",
          subject: "Neural Networks",
          meetingId: meetingId,
          allowGuest: true, // Default to guest access allowed for demo
        });
      }
    }
  }, [meetingId, sessions]);

  const handleJoinAsGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    // Login as a Guest user
    setUser({
      id: "guest-" + Date.now(),
      name: guestName.trim() + " (Guest)",
      email: "guest@meetpulse.live",
    });
    setRole("participant");
    setOrg("education");

    // Set Live Session
    setLiveSessionId(session?.id || "SESS-101");
    setAudienceCount(35);

    alert("Joined live meeting successfully as Guest!");
    navigate("/app");
  };

  const handleGoToLogin = () => {
    navigate(`/login?redirect=/join?meetingId=${meetingId}`);
  };

  if (!meetingId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <GlowOrbs />
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 relative z-10 shadow-2xl space-y-6 text-center">
          <h2 className="text-xl font-bold text-rose-400">Invalid Meeting ID</h2>
          <p className="text-xs text-muted-foreground">Please scan a valid QR code or enter a valid join link.</p>
          <button 
            onClick={() => navigate("/")}
            className="w-full bg-white/5 border border-white/10 text-white py-2 rounded-xl text-xs font-semibold hover:bg-white/10 cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowOrbs />
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 relative z-10 shadow-2xl space-y-6">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground">{session?.name || "Loading Session..."}</h2>
          <p className="text-xs text-indigo-300 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full inline-block border border-indigo-400/20">
            {session?.course || "Course Topic"}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">Meeting ID: {meetingId}</p>
        </div>

        {session?.allowGuest !== false ? (
          <form onSubmit={handleJoinAsGuest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Your Name (Guest Access)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  required 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)} 
                  placeholder="e.g. Alex Thompson" 
                  className="w-full bg-input rounded-xl border border-border pl-10 pr-4 py-3 text-xs focus:border-primary/50 outline-none text-white" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="w-4 h-4" /> Join as Guest
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-3 text-[9px] text-slate-500 uppercase font-bold">Or Sign In</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoToLogin}
              className="w-full bg-slate-900 border border-white/10 hover:border-primary/50 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" /> Sign In / Create Account to Join
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2 justify-center">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Strict Login Required for this Presentation.</span>
            </div>
            
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The host of this meeting has disabled Guest Access. Please login with your organization email credentials to join the presentation.
            </p>

            <button 
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" /> Sign In to Join Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
