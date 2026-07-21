import { useState } from "react";
import { motion } from "motion/react";
import {
  Brain, Activity, Target, Mic, Menu, X, Layers,
  BarChart2, ArrowRight, Sparkles, Radio, Check, ChevronDown, Play
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
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:mx-0">
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
              <div className="absolute bottom-2.5 right-3 flex gap-0.5">
                {["😊", "🚀", "👏"].map((e, i) => (
                  <span key={i} className="text-sm animate-bounce" style={{ animationDelay: `${i * 200}ms` }}>{e}</span>
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
              <div className="flex items-end gap-1 mt-1"><span className="text-3xl font-bold text-white leading-none">91</span><span className="text-xs text-emerald-400 mb-0.5">/ 100</span></div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                <div className="h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" style={{ width: "91%" }} />
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-2">Live Q&amp;A</p>
              {["How does transfer learning work?", "What dataset was used?"].map((q, i) => (
                <div key={i} className="text-[9px] text-slate-300 bg-white/[0.04] rounded-lg p-2 mb-1.5 leading-relaxed border border-white/[0.04]">{q}</div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 rounded-xl p-3 border border-purple-500/20">
              <div className="flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3 h-3 text-purple-400" /><p className="text-[8px] font-mono text-purple-400">AI INSIGHT</p></div>
              <p className="text-[9px] text-slate-300 leading-relaxed">Confusion spike on slide 4. Consider adding a visual analogy.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-lg shadow-emerald-500/10">
        <Activity className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-emerald-300">247 Active Now</span>
      </div>
      <div className="absolute -bottom-4 -left-4 backdrop-blur-xl bg-cyan-500/10 border border-cyan-500/30 rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-lg shadow-cyan-500/10">
        <Brain className="w-4 h-4 text-cyan-400" /><span className="text-xs font-semibold text-cyan-300">AI Transcribing…</span>
      </div>
    </div>
  );
}

export function LandingPage({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navLinks = ["Features", "Solutions", "Pricing"];

  const features = [
    { icon: Layers, title: "Interactive Presentations", desc: "Slides sync live across all devices. Participants follow in real-time with reactions, annotations, and bookmarks.", grad: "from-indigo-500 to-purple-600" },
    { icon: Brain, title: "AI Meeting Intelligence", desc: "Whisper-powered transcription, GPT summaries, and action item extraction — all generated automatically.", grad: "from-purple-500 to-pink-600" },
    { icon: Activity, title: "Smart Attendance", desc: "Measure real participation: reactions, polls, questions, and pulse scores — not just who opened the tab.", grad: "from-cyan-500 to-blue-500" },
    { icon: Target, title: "Audience Understanding", desc: "Real-time confusion detection and micro-quizzes surface comprehension gaps before they become problems.", grad: "from-emerald-500 to-teal-500" },
    { icon: Mic, title: "Presenter Coaching", desc: "AI analyzes speaking pace, engagement dips, and timing to help you become a more effective communicator.", grad: "from-orange-500 to-amber-500" },
    { icon: BarChart2, title: "Advanced Analytics", desc: "Heatmaps, radar charts, trend lines, and department dashboards exportable to PDF.", grad: "from-violet-500 to-indigo-500" },
  ];

  const tiers = [
    { name: "Starter", m: 0, a: 0, desc: "For individuals", features: ["5 sessions / month", "30 participants", "Basic analytics", "AI transcript (30 min)", "Email support"], cta: "Start Free", hi: false },
    { name: "Pro", m: 29, a: 23, desc: "For regular presenters", features: ["Unlimited sessions", "200 participants", "Full analytics", "Unlimited AI transcript", "AI summaries & actions", "Presenter coaching"], cta: "Start 14-Day Trial", hi: true },
    { name: "Enterprise", m: 99, a: 79, desc: "For organizations", features: ["Everything in Pro", "Unlimited participants", "Multi-department", "SSO & SAML", "Dedicated manager", "SLA guarantee"], cta: "Contact Sales", hi: false },
  ];

  const faqs = [
    { q: "Does MeetPulse replace Zoom or Google Meet?", a: "No — MeetPulse works alongside your video conferencing platform. Your meeting happens on Zoom, Teams, or Meet; MeetPulse adds the intelligence layer: slides, engagement, AI summaries, and analytics." },
    { q: "How does AI transcription work?", a: "MeetPulse uses OpenAI Whisper for real-time speech-to-text. Transcripts are timestamped and searchable, and automatically fed into the GPT summary and action item engines." },
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
              {navLinks.map(l => <button key={l} className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">{l}</button>)}
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
              {navLinks.map(l => <button key={l} className="w-full text-left text-sm text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/5">{l}</button>)}
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
                <button className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-white px-7 py-3.5 rounded-xl font-semibold text-[15px] transition-colors hover:bg-white/5 active:scale-95">
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

      {/* Trusted by */}
      <div className="py-12 border-y border-white/6">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-xs font-semibold text-slate-600 uppercase tracking-widest mb-8">Trusted by leading universities and enterprises</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {["Stanford", "MIT", "Stripe", "Deloitte", "Notion", "Figma", "Vercel", "Salesforce"].map(l => (
              <div key={l} className="text-slate-600 font-bold text-lg tracking-tight hover:text-slate-400 transition-colors cursor-default">{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-24 px-4">
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

      {/* Pricing */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/15 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">Simple Pricing</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Start free, scale as you grow</h2>
            <div className="inline-flex bg-white/[0.04] border border-white/10 rounded-full p-1.5 mt-4">
              <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"}`}>Monthly</button>
              <button onClick={() => setAnnual(true)} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"}`}>
                Annual <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">-20%</span>
              </button>
            </div>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {tiers.map((t, i) => (
              <motion.div key={t.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                whileHover={{ y: t.hi ? -4 : -2, transition: { duration: 0.2 } }}
                className={`relative rounded-2xl p-7 flex flex-col transition-all ${t.hi ? "bg-gradient-to-b from-indigo-950/60 to-[#111827] border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/15" : "bg-[#111827] border border-white/8"}`}>
                {t.hi && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap">Most Popular</div>}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{t.name}</h3>
                  <p className="text-slate-500 text-sm">{t.desc}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">${annual ? t.a : t.m}</span>
                    {(annual ? t.a : t.m) > 0 && <span className="text-slate-500 text-sm mb-1.5">/ mo</span>}
                  </div>
                  {(annual ? t.a : t.m) === 0 && <span className="text-slate-500 text-sm">Free forever</span>}
                </div>
                <ul className="space-y-3 flex-1 mb-7">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className={`w-4 h-4 shrink-0 ${t.hi ? "text-indigo-400" : "text-slate-500"}`} />{f}
                    </li>
                  ))}
                </ul>
                <button onClick={onSignup} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${t.hi ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25" : "border border-white/10 text-white hover:border-white/20 hover:bg-white/5"}`}>
                  {t.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
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
      <section className="py-20 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mx-auto max-w-4xl">
          <div className="relative bg-gradient-to-br from-indigo-950/80 via-purple-950/60 to-[#111827] border border-indigo-500/20 rounded-3xl p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/5 pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            <div className="relative">
              <h2 className="text-5xl font-extrabold text-white tracking-tight mb-6">Ready to run smarter meetings?</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Join 500+ organizations already using MeetPulse to engage audiences, extract insights, and never lose another action item.</p>
              <button onClick={onSignup} className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity shadow-xl shadow-indigo-500/30 active:scale-95">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 pt-16 pb-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-14">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                <span className="text-[17px] font-bold text-white">MeetPulse</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">AI-powered presentation and meeting intelligence for universities and enterprises worldwide.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { title: "Product", links: ["Features", "Solutions", "Pricing", "Changelog"] },
                { title: "Solutions", links: ["Education", "Business", "Enterprise"] },
                { title: "Resources", links: ["Docs", "API Reference", "Blog"] },
                { title: "Company", links: ["About", "Careers", "Contact", "Legal"] },
              ].map(col => (
                <div key={col.title}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{col.title}</p>
                  <ul className="space-y-2.5">{col.links.map(l => <li key={l}><button className="text-sm text-slate-500 hover:text-white transition-colors">{l}</button></li>)}</ul>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© 2025 MeetPulse, Inc. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {["Privacy", "Terms", "Security"].map(l => <button key={l} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{l}</button>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
