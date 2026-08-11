import { useState } from "react";
import { motion } from "motion/react";
import {
  Brain, Activity, Target, Mic, Menu, X, Layers,
  BarChart2, ArrowRight, Sparkles, Radio, Check, ChevronDown, Play,
  GraduationCap, Briefcase, Building2, Star
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { GlowOrbs } from "../components/common/CommonUI";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const }
  })
};

const engData = [
  { n: "09:00", v: 75 },
  { n: "09:05", v: 82 },
  { n: "09:10", v: 88 },
  { n: "09:15", v: 91 },
  { n: "09:20", v: 85 },
  { n: "09:25", v: 89 }
];

function HeroMockup() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [reactions, setReactions] = useState<{emoji: string, id: number}[]>([
    {emoji: "😊", id: 1}, {emoji: "🚀", id: 2}, {emoji: "👏", id: 3}
  ]);
  const [questions, setQuestions] = useState<string[]>([
    "How does transfer learning work?",
    "What dataset was used?"
  ]);
  const [engScore, setEngScore] = useState(91);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const simulateReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    setReactions(prev => [...prev.slice(-5), { emoji, id }]);
    setEngScore(prev => Math.min(100, prev + 1));
  };

  const simulateQuestion = () => {
    setQuestions(prev => ["Could you explain the backpropagation step?", ...prev].slice(0, 3));
    setEngScore(prev => Math.min(100, prev + 3));
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:mx-0 flex flex-col gap-6">
      {/* Playground Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-3 backdrop-blur-md relative z-10 shadow-lg">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-2 hidden sm:block">Live Demo</span>
        {["😊", "🚀", "🔥"].map(emoji => (
          <button key={emoji} onClick={() => simulateReaction(emoji)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-lg transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {emoji}
          </button>
        ))}
        <button onClick={simulateQuestion} className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-sm font-semibold transition-all active:scale-95">
          Ask Question
        </button>
      </div>

      <div 
        className="relative w-full"
        style={{ perspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      >
        <motion.div 
          animate={{ rotateY: mousePos.x * 15, rotateX: -mousePos.y * 15 }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/8">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-1.5">
                <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                <span className="text-[11px] text-slate-400 font-mono">LIVE · 247 participants</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white">MP</div>
            </div>
            <div className="grid grid-cols-5 divide-x divide-white/[0.05]">
              <div className="col-span-3 p-3 space-y-3">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-indigo-900/80 via-purple-900/60 to-slate-900/80 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center text-center p-4">
                  <p className="relative text-[9px] font-mono text-indigo-300 uppercase tracking-widest mb-1.5">Slide 4 / 12</p>
                  <p className="relative text-sm font-bold text-white leading-snug">Machine Learning in Healthcare</p>
                  <p className="relative text-[10px] text-slate-400 mt-1">Neural networks for diagnostic imaging</p>
                  <div className="absolute bottom-2.5 right-3 flex gap-1">
                    {reactions.map((r, i) => (
                      <motion.span 
                        key={r.id} 
                        initial={{ opacity: 0, y: 10, scale: 0.5 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        className="text-sm"
                      >
                        {r.emoji}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div className="h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g0" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 10 }} />
                      <Area type="monotone" dataKey="v" stroke="#6366F1" strokeWidth={1.5} fill="url(#g0)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-span-2 p-3 space-y-2.5">
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Engagement</p>
                  <div className="flex items-end gap-1 mt-1"><span className="text-3xl font-bold text-white leading-none">{engScore}</span><span className="text-xs text-emerald-400 mb-0.5">/ 100</span></div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                    <motion.div animate={{ width: `${engScore}%` }} className="h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />
                  </div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-2">Live Q&amp;A</p>
                  {questions.map((q, i) => (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} key={q + i} className="text-[9px] text-slate-300 bg-white/[0.04] rounded-lg p-2 mb-1.5 leading-relaxed border border-white/[0.04]">{q}</motion.div>
                  ))}
                </div>
                <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 rounded-xl p-3 border border-purple-500/20">
                  <div className="flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3 h-3 text-purple-400" /><p className="text-[8px] font-mono text-purple-400">AI INSIGHT</p></div>
                  <p className="text-[9px] text-slate-300 leading-relaxed">Confusion spike on slide 4. Consider adding a visual analogy.</p>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="absolute -top-4 -right-4 backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-lg shadow-emerald-500/10"
            style={{ transform: "translateZ(30px)" }}
          >
            <Activity className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-emerald-300">247 Active Now</span>
          </div>
          <div 
            className="absolute -bottom-4 -left-4 backdrop-blur-xl bg-cyan-500/10 border border-cyan-500/30 rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-lg shadow-cyan-500/10"
            style={{ transform: "translateZ(40px)" }}
          >
            <Brain className="w-4 h-4 text-cyan-400" /><span className="text-xs font-semibold text-cyan-300">AI Transcribing…</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function LandingPage({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const navLinks = ["Features", "Solutions"];

  const features = [
    { icon: Layers, title: "Interactive Presentations", desc: "Slides sync live across all devices. Participants follow in real-time with reactions, annotations, and bookmarks.", grad: "from-indigo-500 to-purple-600" },
    { icon: Brain, title: "AI Meeting Intelligence", desc: "Real-time transcription, AI summaries, and action item extraction — all generated automatically.", grad: "from-purple-500 to-pink-600" },
    { icon: Activity, title: "Smart Attendance", desc: "Measure real participation: reactions, polls, questions, and pulse scores — not just who opened the tab.", grad: "from-cyan-500 to-blue-500" },
    { icon: Target, title: "Audience Understanding", desc: "Real-time confusion detection and micro-quizzes surface comprehension gaps before they become problems.", grad: "from-emerald-500 to-teal-500" },
    { icon: Mic, title: "Presenter Coaching", desc: "AI analyzes speaking pace, engagement dips, and timing to help you become a more effective communicator.", grad: "from-orange-500 to-amber-500" },
    { icon: BarChart2, title: "Advanced Analytics", desc: "Heatmaps, radar charts, trend lines, and department dashboards exportable to PDF.", grad: "from-violet-500 to-indigo-500" },
  ];

  const faqs = [
    { q: "Does MeetPulse replace Zoom or Google Meet?", a: "No — MeetPulse works alongside your video conferencing platform. Your meeting happens on Zoom, Teams, or Meet; MeetPulse adds the intelligence layer: slides, engagement, AI summaries, and analytics." },
    { q: "How does AI transcription work?", a: "MeetPulse uses advanced AI for real-time speech-to-text. Transcripts are timestamped and searchable, and automatically fed into the summary and action item engines." },
    { q: "Can participants join without an account?", a: "Yes — participants join via QR code or meeting ID with no registration required. They get full access to slides, polls, Q&A, and reactions immediately." },
    { q: "How is attendance measured?", a: "Smart Attendance tracks real participation: join time, active duration, slide interactions, poll responses, questions asked, and reactions sent — combined into an Engagement Score." },
    { q: "Is my data secure?", a: "Yes — MeetPulse is SOC 2 Type II compliant, GDPR-ready, and FERPA-compliant for education. All data is encrypted at rest and in transit." },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] overflow-x-hidden">
      <GlowOrbs />

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"><Sparkles className="w-4 h-4 text-white" /></div>
              <span className="text-[17px] font-bold tracking-tight text-white">MeetPulse</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <button key={l} onClick={() => {
                  const target = document.getElementById(l.toLowerCase());
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                  else alert(`Navigating to ${l}...`);
                }} className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                  {l}
                </button>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={onLogin} className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">Log in</button>
              <button onClick={onSignup} className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 active:scale-95">Get Started Free</button>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white p-1.5" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {menuOpen && (
            <div className="md:hidden mt-2 backdrop-blur-2xl bg-[#0F172A]/98 border border-white/10 rounded-2xl p-4 space-y-1 shadow-xl">
              {navLinks.map(l => (
                <button key={l} onClick={() => {
                  setMenuOpen(false);
                  const target = document.getElementById(l.toLowerCase());
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                  else alert(`Navigating to ${l}...`);
                }} className="w-full text-left text-sm text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/5">
                  {l}
                </button>
              ))}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <button onClick={onLogin} className="w-full text-left text-sm text-slate-400 px-3 py-2.5">Log in</button>
                <button onClick={onSignup} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl font-semibold text-sm">Get Started Free</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-28 pb-20 px-4 overflow-hidden">
        <div className="mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 rounded-full px-4 py-2 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-300 tracking-wide">AI-Powered Meeting Intelligence</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
                className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
                Transform Every{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Presentation</span>{" "}
                Into an Intelligent Conversation
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }}
                className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
                MeetPulse combines AI, real-time interaction, and deep analytics to make every presentation more engaging, measurable, and memorable — alongside Zoom, Teams, or Meet.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3">
                <button onClick={onSignup} className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-7 py-3.5 rounded-xl font-semibold text-[15px] hover:opacity-90 transition-opacity shadow-xl shadow-indigo-500/30 active:scale-95">
                  Start Free Today <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setVideoModalOpen(true)} className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-white px-7 py-3.5 rounded-xl font-semibold text-[15px] transition-colors hover:bg-white/5 active:scale-95">
                  <Play className="w-4 h-4 text-indigo-400" />Watch Demo
                </button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.45 }}
                className="flex items-center gap-8 mt-12 pt-10 border-t border-white/8">
                {[{ v: "500+", l: "Organizations" }, { v: "2.4M", l: "Sessions run" }, { v: "91%", l: "Avg engagement" }].map(s => (
                  <div key={s.l}><p className="text-2xl font-bold text-white">{s.v}</p><p className="text-xs text-slate-500 mt-0.5">{s.l}</p></div>
                ))}
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              <HeroMockup />
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
      </section>

      {/* Testimonial Marquee */}
      <section className="py-12 border-y border-white/5 bg-[#111827]/30 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 mb-8 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Loved by leading universities & forward-thinking enterprises</p>
        </div>
        <div className="relative flex overflow-hidden group">
          <div className="absolute left-0 inset-y-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10" />
          <div className="absolute right-0 inset-y-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10" />
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            className="flex gap-6 items-center px-6 w-max"
          >
            {[
              { text: "MeetPulse completely changed how I run my lectures. The smart attendance alone saves me hours.", name: "Dr. Sarah Jenkins", role: "Computer Science Professor" },
              { text: "Our all-hands meetings went from passive webinars to highly interactive sessions.", name: "Mark T.", role: "VP of Engineering" },
              { text: "The AI Q&A summary at the end of class is a lifesaver for students who missed the lecture.", name: "Emily R.", role: "Teaching Assistant" },
              { text: "We use the confusion detection to pause and clarify complex topics instantly. Game changer.", name: "Prof. David Chen", role: "Physics Dept" },
              { text: "Exporting the engagement reports to PDF makes compliance reporting for our training programs so easy.", name: "Lisa Wong", role: "HR Director" },
              // Duplicate set for seamless loop
              { text: "MeetPulse completely changed how I run my lectures. The smart attendance alone saves me hours.", name: "Dr. Sarah Jenkins", role: "Computer Science Professor" },
              { text: "Our all-hands meetings went from passive webinars to highly interactive sessions.", name: "Mark T.", role: "VP of Engineering" },
              { text: "The AI Q&A summary at the end of class is a lifesaver for students who missed the lecture.", name: "Emily R.", role: "Teaching Assistant" },
              { text: "We use the confusion detection to pause and clarify complex topics instantly. Game changer.", name: "Prof. David Chen", role: "Physics Dept" },
              { text: "Exporting the engagement reports to PDF makes compliance reporting for our training programs so easy.", name: "Lisa Wong", role: "HR Director" },
            ].map((t, i) => (
              <div key={i} className="w-[400px] shrink-0 bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-xl hover:border-indigo-500/30 transition-colors">
                <div className="flex gap-1 mb-4 text-emerald-400">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-slate-300 text-[15px] leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">Platform Features</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Everything your meeting is missing</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">Six integrated modules. One unified intelligence layer on top of the meetings you already run.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group bg-[#111827] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.grad} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-4 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-24">
            <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Intelligence in three steps</h2>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row gap-16 relative">
            <div className="w-full lg:w-1/2 space-y-32 py-12 px-4">
              {[
                { step: "01", title: "Start your session", desc: "Whether in a live lecture hall or over Zoom, participants join instantly by scanning a QR code on the projector—no downloads required." },
                { step: "02", title: "AI analyzes in real-time", desc: "While you present, our AI transcribes everything. It tracks room engagement, surfaces confusion spikes, and handles student questions live." },
                { step: "03", title: "Export actionable insights", desc: "After the session, instantly download a comprehensive summary containing attendance, action items, and presenter coaching feedback." }
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ margin: "-20%", once: true }} transition={{ duration: 0.6 }} className="relative">
                  <div className="absolute -left-4 -top-8 text-7xl font-black text-white/[0.03] tracking-tighter select-none">{s.step}</div>
                  <h3 className="text-3xl font-bold text-white mb-4 relative z-10">{s.title}</h3>
                  <p className="text-lg text-slate-400 leading-relaxed max-w-md relative z-10">{s.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="hidden lg:block w-full lg:w-1/2 relative">
              <div className="sticky top-32 w-full aspect-square flex items-center justify-center relative">
                {/* Base Plate */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 rounded-full blur-[80px] mix-blend-screen" />
                
                {/* Center Piece: Live Room */}
                <div className="relative z-20 w-72 h-[340px] bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex flex-col items-center p-6 justify-between">
                   <div className="text-center w-full">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 mx-auto flex items-center justify-center mb-3">
                       <Radio className="w-6 h-6 text-indigo-400" />
                     </div>
                     <h4 className="text-lg text-white font-bold tracking-tight">Room ENG-101</h4>
                     <p className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"/> 
                       Live Session
                     </p>
                   </div>
                   
                   <div className="w-36 h-36 bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner">
                     <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-1">
                       {[1,0,1,1, 0,1,0,1, 1,1,1,0, 0,0,1,1].map((v, i) => (
                         <div key={i} className={`rounded-sm transition-opacity duration-1000 ${v ? 'bg-[#0F172A] opacity-100' : 'bg-transparent opacity-0'}`} />
                       ))}
                     </div>
                   </div>
                   
                   <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase">meetpulse.com/eng-101</p>
                </div>

                {/* Floating elements */}
                <motion.div animate={{ y: [-15, 15, -15] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute z-30 -right-8 top-1/4 bg-[#1E293B]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30"><Mic className="w-5 h-5 text-cyan-400" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono tracking-widest mb-0.5">SPEECH AI</p>
                    <p className="text-sm font-semibold text-white">Transcribing audio...</p>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [15, -15, 15] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute z-30 -left-12 bottom-1/4 bg-[#1E293B]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30"><BarChart2 className="w-5 h-5 text-purple-400" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono tracking-widest mb-0.5">ENGAGEMENT</p>
                    <p className="text-sm font-semibold text-white">Attention at 94%</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">Tailored Solutions</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Built for every environment</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">Whether you are teaching a lecture hall of 500 or running a board meeting of 5.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Education", icon: GraduationCap, desc: "For universities and schools. Engage students with live quizzes, track smart attendance, and integrate directly with Canvas and Blackboard.", grad: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-500/20 hover:border-emerald-500/50", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", linkColor: "text-emerald-400" },
              { title: "Business", icon: Briefcase, desc: "For teams and agencies. Keep remote teams aligned with AI summaries, action item extraction, and interactive all-hands meetings.", grad: "from-blue-500/20 to-cyan-500/5", border: "border-blue-500/20 hover:border-blue-500/50", iconBg: "bg-blue-500/10", iconColor: "text-blue-400", linkColor: "text-blue-400" },
              { title: "Enterprise", icon: Building2, desc: "For large organizations. SOC-2 compliance, SSO integration, dedicated account management, and cross-department analytics.", grad: "from-purple-500/20 to-indigo-500/5", border: "border-purple-500/20 hover:border-purple-500/50", iconBg: "bg-purple-500/10", iconColor: "text-purple-400", linkColor: "text-purple-400" }
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className={`group relative overflow-hidden bg-[#111827]/80 backdrop-blur-sm border ${s.border} rounded-[2rem] p-8 hover:-translate-y-2 transition-all duration-300 shadow-xl`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${s.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{s.title}</h3>
                    <p className="text-slate-400 text-[15px] leading-relaxed mb-8">{s.desc}</p>
                    <button onClick={onLogin} className={`text-sm font-semibold ${s.linkColor} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                      Explore {s.title} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">FAQ</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Everything you need to know</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className={`bg-[#111827] border rounded-2xl overflow-hidden transition-colors ${openFaq === i ? "border-indigo-500/30" : "border-white/8"}`}>
                <button className="w-full flex items-center justify-between px-6 py-5 text-left group" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-[15px] text-white group-hover:text-indigo-300 transition-colors">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-indigo-400" : ""}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-5"><p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mx-auto max-w-5xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#0F172A] border border-white/10 rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div className="absolute -top-48 -right-48 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[128px] opacity-40"></div>
            <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[128px] opacity-40"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex -space-x-3 mb-8">
                {["https://i.pravatar.cc/100?img=33", "https://i.pravatar.cc/100?img=47", "https://i.pravatar.cc/100?img=12", "https://i.pravatar.cc/100?img=32"].map((src, i) => (
                  <img key={i} src={src} alt="User avatar" className="w-10 h-10 rounded-full border-2 border-[#0F172A] shadow-sm relative z-10" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-white/5 flex items-center justify-center text-[10px] font-bold text-white relative z-20 backdrop-blur-md">
                  +500
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                Ready to run <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">smarter meetings?</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join 500+ organizations already using MeetPulse to engage audiences, extract insights, and never lose another action item.
              </p>
              <button onClick={onSignup} className="group relative inline-flex items-center gap-2 bg-white text-[#0F172A] px-8 py-4 rounded-full font-bold text-[16px] hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] active:scale-95">
                <span className="relative z-10 flex items-center gap-2">Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#020617]/90">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" onClick={() => setVideoModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-5xl aspect-video bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 flex items-center justify-center">
            <button onClick={() => setVideoModalOpen(false)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-white/10 text-white rounded-full flex items-center justify-center z-10 transition-colors border border-white/10">
              <X className="w-5 h-5" />
            </button>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                <Play className="w-8 h-8 text-indigo-400 ml-1" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Watch MeetPulse in Action</h3>
              <p className="text-slate-400 max-w-md mx-auto">This interactive placeholder will be replaced with a high-quality embedded demonstration video or GIF.</p>
            </div>
          </motion.div>
        </div>
      )}

      <footer className="py-12 border-t border-white/5 mt-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-14">
            <div className="max-w-xs text-left">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                <span className="text-[17px] font-bold text-white">MeetPulse</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed text-left">AI-powered presentation and meeting intelligence for universities and enterprises worldwide.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
              {[
                { title: "Product", links: ["Features", "Solutions", "Changelog"] },
                { title: "Solutions", links: ["Education", "Business", "Enterprise"] },
                { title: "Resources", links: ["Docs", "API Reference", "Blog"] },
                { title: "Company", links: ["About", "Careers", "Contact", "Legal"] },
              ].map(col => (
                <div key={col.title}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{col.title}</p>
                  <ul className="space-y-2.5">{col.links.map(l => (
                    <li key={l}>
                      <button onClick={() => {
                        const targetId = l.toLowerCase();
                        const target = document.getElementById(targetId);
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                        else alert(`Navigating to ${l} page...`);
                      }} className="text-sm text-slate-500 hover:text-white transition-colors">
                        {l}
                      </button>
                    </li>
                  ))}</ul>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© 2025 MeetPulse, Inc. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {["Privacy", "Terms", "Security"].map(l => (
                <button key={l} onClick={() => alert(`Opening ${l} policy...`)} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
