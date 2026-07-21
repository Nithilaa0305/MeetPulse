import React, { useEffect, Component, ErrorInfo, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkle, Sun, Moon } from "lucide-react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { OrgSelectPage, RoleSelectPage, DetailsPage } from "./pages/SetupPages";
import { AppShell } from "./AppShell";

// Zustand Stores
import { useAuthStore } from "../store/useAuthStore";
import { useMeetingStore } from "../store/useMeetingStore";
import { useDataStore } from "../store/useDataStore";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-rose-500 bg-rose-500/10 rounded-xl m-10">
          <h1 className="text-xl font-bold mb-4">Something went wrong.</h1>
          <pre className="text-xs whitespace-pre-wrap">{this.state.error?.toString()}</pre>
          <pre className="text-xs whitespace-pre-wrap mt-4">{this.state.error?.stack}</pre>
          <button onClick={() => window.location.href = '/'} className="mt-4 bg-rose-600 text-white px-4 py-2 rounded-lg">Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Zustand State
  const { org, role, setOrg, setRole, login, logout, user } = useAuthStore();
  const [theme, setTheme] = React.useState<"dark" | "light">((typeof window !== "undefined" && localStorage.getItem("meetpulse-theme") as "dark" | "light") || "dark");
  const [showSimulator, setShowSimulator] = React.useState(false);
  const viewportMode = "desktop"; // Hardcoded for now as it was in original

  useEffect(() => {
    const rootEl = window.document.documentElement;
    if (theme === "light") {
      rootEl.classList.add("light");
      rootEl.classList.remove("dark");
    } else {
      rootEl.classList.add("dark");
      rootEl.classList.remove("light");
    }
    localStorage.setItem("meetpulse-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      
      {/* GLOBAL SIMULATOR WRAPPER */}
      {showSimulator && (
        <div className="bg-primary/20 border-b border-primary/30 py-2.5 px-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold select-none backdrop-blur-md sticky top-0 z-[100]">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-primary animate-spin" />
            <span className="text-[11px] uppercase tracking-wider text-primary-foreground font-bold bg-primary px-2 py-0.5 rounded">MeetPulse Sandbox Simulator</span>
          </div>

          <div className="flex items-center gap-1 bg-card border border-border p-0.5 rounded-lg">
            <button 
              onClick={() => { setRole("superadmin"); navigate('/app'); }}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${role === "superadmin" ? "bg-primary text-white" : "hover:text-primary text-muted-foreground"}`}>
              SaaS Super Admin
            </button>
            <div className="h-4 w-px bg-border mx-1" />
            <span className="text-[10px] text-muted-foreground px-1 uppercase font-bold">Edu:</span>
            <button 
              onClick={() => { setOrg("education"); setRole("admin"); navigate('/app'); }}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${org === "education" && role === "admin" ? "bg-primary text-white" : "hover:text-primary text-muted-foreground"}`}>
              Admin
            </button>
            <button 
              onClick={() => { setOrg("education"); setRole("presenter"); navigate('/app'); }}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${org === "education" && role === "presenter" ? "bg-primary text-white" : "hover:text-primary text-muted-foreground"}`}>
              Presenter
            </button>
            <button 
              onClick={() => { setOrg("education"); setRole("participant"); navigate('/app'); }}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${org === "education" && role === "participant" ? "bg-primary text-white" : "hover:text-primary text-muted-foreground"}`}>
              Participant
            </button>
            <div className="h-4 w-px bg-border mx-1" />
            <span className="text-[10px] text-muted-foreground px-1 uppercase font-bold">Biz:</span>
            <button 
              onClick={() => { setOrg("business"); setRole("admin"); navigate('/app'); }}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${org === "business" && role === "admin" ? "bg-primary text-white" : "hover:text-primary text-muted-foreground"}`}>
              Admin
            </button>
            <button 
              onClick={() => { setOrg("business"); setRole("presenter"); navigate('/app'); }}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${org === "business" && role === "presenter" ? "bg-primary text-white" : "hover:text-primary text-muted-foreground"}`}>
              Presenter
            </button>
            <button 
              onClick={() => { setOrg("business"); setRole("participant"); navigate('/app'); }}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${org === "business" && role === "participant" ? "bg-primary text-white" : "hover:text-primary text-muted-foreground"}`}>
              Employee
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-primary-foreground hover:text-primary active:scale-90 transition-all cursor-pointer">
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <button 
              onClick={() => setShowSimulator(false)} 
              className="bg-white/5 border border-border hover:bg-white/10 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
              Hide Sandbox
            </button>
          </div>
        </div>
      )}

      {!showSimulator && (
        <button 
          onClick={() => setShowSimulator(true)} 
          className="fixed bottom-4 right-4 z-[999] bg-primary text-white px-3 py-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer">
          🛠️ Show Sandbox Controller
        </button>
      )}

      {/* MAIN VIEW CONTAINER */}
      <div className="flex items-center justify-center p-0 w-full min-h-screen bg-muted/30">
        <div className={`w-full min-h-screen transition-all duration-300 w-full max-w-none border-none rounded-none shadow-none min-h-screen`}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LandingPage onLogin={() => navigate('/login')} onSignup={() => navigate('/register')} />
                </motion.div>
              } />
              
              <Route path="/login" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoginPage onNext={() => navigate('/setup/org')} onSignup={() => navigate('/register')} onForgotPassword={() => navigate('/forgot-password')} onDirectApp={() => {
                    navigate('/app');
                  }} />
                </motion.div>
              } />

              <Route path="/register" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RegisterPage onNext={() => navigate('/setup/org')} onLogin={() => navigate('/login')} onDirectApp={() => {
                    navigate('/app');
                  }} />
                </motion.div>
              } />

              <Route path="/forgot-password" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ForgotPasswordPage onBackToLogin={() => navigate('/login')} />
                </motion.div>
              } />

              <Route path="/setup/org" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <OrgSelectPage onSelect={o => { setOrg(o); navigate('/setup/role'); }} />
                </motion.div>
              } />

              <Route path="/setup/role" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RoleSelectPage org={org} onSelect={r => { setRole(r); navigate('/setup/details'); }} />
                </motion.div>
              } />

              <Route path="/setup/details" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DetailsPage org={org} role={role} onNext={() => {
                    navigate('/app');
                  }} />
                </motion.div>
              } />

              <Route path="/app/*" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full min-h-screen flex flex-col">
                  <AppShell />
                </motion.div>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
