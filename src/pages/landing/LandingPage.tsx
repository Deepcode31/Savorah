import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  Sparkles, ArrowRight, ScanLine, MessageSquareText, PieChart, Target,
  Bell, TrendingUp, ShieldCheck, Lock, Fingerprint, GraduationCap,
  Briefcase, Users, Heart, ChevronDown, Wallet, Zap, LineChart,
  MessageCircle, IndianRupee, Check, ArrowUpRight, Instagram, Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Counter, Reveal, Magnetic, TiltCard, SplitWords } from '../../components/motion/primitives';
import { Logo } from '../../components/brand/Logo';
import { ThemeToggle } from '../../components/brand/ThemeToggle';
import TextPressure from '../../components/motion/TextPressure';
import { SITE } from '../../config/site';
import { useTheme } from '../../context/ThemeContext';

const HeroScene = lazy(() => import('./HeroScene'));

gsap.registerPlugin(ScrollTrigger);

/* ================================================================== */
/* Shared bits                                                         */
/* ================================================================== */

const SectionTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-semibold tracking-widest uppercase text-emerald-300">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
    {children}
  </div>
);

const SectionHeading: React.FC<{ tag: string; title: string; sub?: string }> = ({ tag, title, sub }) => (
  <div className="max-w-3xl mx-auto text-center mb-14 md:mb-20 px-4">
    <Reveal>
      <SectionTag>{tag}</SectionTag>
    </Reveal>
    <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mt-6 leading-[1.05]">
      <SplitWords text={title} />
    </h2>
    {sub && (
      <Reveal delay={0.15}>
        <p className="text-mist-500 text-base md:text-lg mt-5 leading-relaxed">{sub}</p>
      </Reveal>
    )}
  </div>
);

/* ================================================================== */
/* Navbar                                                              */
/* ================================================================== */

const LandingNav: React.FC<{ onGetStarted: () => void; onSignIn: () => void }> = ({ onGetStarted, onSignIn }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Personas', href: '#personas' },
    { label: 'AI Coach', href: '#ai' },
    { label: 'Security', href: '#security' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex items-center justify-between gap-6 w-full max-w-6xl rounded-2xl px-5 py-3 transition-all duration-500 ${
          scrolled ? 'glass-strong card-ring' : 'bg-transparent border border-transparent'
        }`}
        aria-label="Main"
      >
        <a href="#" className="flex items-center group" aria-label="Savorah home">
          <Logo size={36} wordmarkClassName="text-lg" />
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 rounded-lg text-sm text-mist-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onSignIn}
            className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium text-mist-300 hover:text-white transition-colors"
          >
            Sign in
          </button>
          <Magnetic strength={0.25}>
            <button
              onClick={onGetStarted}
              className="btn-accent px-4.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </button>
          </Magnetic>
        </div>
      </nav>
    </motion.header>
  );
};

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

const FloatingDashboardCard: React.FC = () => (
  <TiltCard max={7} className="w-full max-w-xl mx-auto">
    <div className="glass-strong card-ring rounded-3xl p-5 md:p-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">Net savings · July</p>
          <p className="font-display text-3xl md:text-4xl font-bold mt-1">
            <Counter value={18420} prefix="₹" />
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
          <TrendingUp className="w-3.5 h-3.5" /> +12.4%
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-24 mb-5" aria-hidden>
        {[38, 52, 44, 66, 58, 78, 62, 88, 72, 95, 84, 100].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-500/30 to-emerald-400"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: 0.6 + i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Budget health', value: '86%', icon: PieChart },
          { label: 'Goals on track', value: '3 / 4', icon: Target },
          { label: 'AI insights', value: '5 new', icon: Sparkles },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-3">
            <s.icon className="w-4 h-4 text-emerald-300 mb-2" />
            <p className="text-sm font-bold">{s.value}</p>
            <p className="text-[10px] text-mist-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </TiltCard>
);

const Hero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useLayoutEffect(() => {
    if (reduced || !wrap.current) return;
    const ctx = gsap.context(() => {
      gsap.to('[data-hero-copy]', {
        yPercent: -18,
        opacity: 0.15,
        scale: 0.94,
        ease: 'none',
        scrollTrigger: { trigger: wrap.current, start: 'top top', end: '75% top', scrub: true },
      });
      gsap.to('[data-hero-card]', {
        yPercent: -32,
        ease: 'none',
        scrollTrigger: { trigger: wrap.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.utils.toArray<HTMLElement>('[data-rupee]').forEach((el, i) => {
        gsap.to(el, {
          y: () => -80 - i * 40,
          rotation: i % 2 === 0 ? 24 : -20,
          ease: 'none',
          scrollTrigger: { trigger: wrap.current, start: 'top top', end: 'bottom top', scrub: 1 },
        });
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={wrap} className="relative min-h-screen flex flex-col justify-center overflow-hidden noise">
      {/* Background layers */}
      <div className="absolute inset-0 grid-fade" aria-hidden />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] rounded-full bg-emerald-600/12 blur-[140px] animate-aurora" aria-hidden />
      <div className="absolute top-1/3 -left-40 w-[36rem] h-[36rem] rounded-full bg-indigo-500/10 blur-[120px] animate-aurora" style={{ animationDelay: '-6s' }} aria-hidden />
      {!reduced && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 opacity-70">
            <HeroScene />
          </div>
        </Suspense>
      )}

      {/* Floating rupee glyphs */}
      {['12%', '78%', '88%', '6%'].map((left, i) => (
        <span
          key={i}
          data-rupee
          aria-hidden
          className="absolute font-display font-bold text-emerald-400/12 select-none animate-float"
          style={{
            left,
            top: `${18 + i * 18}%`,
            fontSize: `${3.5 + (i % 3)}rem`,
            animationDelay: `${i * 1.4}s`,
          }}
        >
          ₹
        </span>
      ))}

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-36 pb-20 text-center">
        <div data-hero-copy>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="flex justify-center mb-8 md:mb-10"
          >
            <SectionTag>AI-native personal finance · Built for India</SectionTag>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.28, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`mx-auto w-full max-w-5xl h-[clamp(4.5rem,16vw,10.5rem)] select-none ${
              isLight
                ? 'drop-shadow-[0_8px_40px_rgba(5,150,105,0.22)]'
                : 'drop-shadow-[0_0_48px_rgba(52,211,153,0.28)]'
            }`}
            aria-label="SAVORAH"
          >
            <TextPressure
              text="SAVORAH"
              uppercase
              flex
              width
              weight
              italic
              shine
              minFontSize={42}
              textColor={isLight ? '#047857' : '#9ae6c8'}
              shineColor={isLight ? '#34d399' : '#ffffff'}
              shineSpeed={2.8}
              className="tracking-[-0.04em]"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="text-mist-500 text-lg md:text-xl max-w-2xl mx-auto mt-8 md:mt-10 leading-relaxed"
          >
            Savorah is your AI financial coach — it reads your statements, receipts and SMS,
            builds budgets that adapt to your life stage, and coaches you toward every goal. In rupees, for real life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Magnetic strength={0.3}>
              <button
                onClick={onGetStarted}
                className="btn-accent px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-2"
              >
                Start free in 60 seconds <ArrowRight className="w-5 h-5" />
              </button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a
                href="#features"
                className="glass px-8 py-4 rounded-2xl text-base font-semibold text-mist-100 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                See how it works <ChevronDown className="w-4 h-4" />
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          data-hero-card
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 md:mt-20"
        >
          <FloatingDashboardCard />
        </motion.div>
      </div>
    </section>
  );
};

/* ================================================================== */
/* Stats strip                                                         */
/* ================================================================== */

const StatsStrip: React.FC = () => (
  <section className="relative border-y hairline bg-ink-900/60">
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        { value: 4, suffix: '', label: 'Adaptive life-stage personas' },
        { value: 3, suffix: '', label: 'AI import pipelines — SMS, receipt, statement' },
        { value: 12, suffix: '+', label: 'Smart spending categories' },
        { value: 100, suffix: '%', label: 'Rupee-first, built for India' },
      ].map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08} className="text-center">
          <p className="font-display text-4xl md:text-5xl font-bold accent-text">
            <Counter value={s.value} suffix={s.suffix} />
          </p>
          <p className="text-mist-500 text-sm mt-2 leading-snug">{s.label}</p>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ================================================================== */
/* Pinned "how it works"                                               */
/* ================================================================== */

const STEPS = [
  {
    icon: ScanLine,
    title: 'Capture everything, type nothing',
    desc: 'Forward a bank SMS, snap a receipt, or drop in a statement. Savorah\u2019s AI parses merchants, amounts and dates in seconds — and blocks duplicates automatically.',
    accent: 'from-emerald-500/25',
    chip: 'AI Import',
  },
  {
    icon: Sparkles,
    title: 'Understand where it all goes',
    desc: 'Every transaction is auto-categorized and analyzed. Get plain-language insights on spending patterns, unusual charges, and where you can realistically save.',
    accent: 'from-indigo-500/25',
    chip: 'AI Insights',
  },
  {
    icon: Target,
    title: 'Grow with budgets that adapt',
    desc: 'AI builds a starter budget from your income and persona, then tracks it live. Set goals, contribute with one tap, and celebrate when you hit them.',
    accent: 'from-amber-500/25',
    chip: 'Budgets & Goals',
  },
];

const HowItWorks: React.FC = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced || !wrap.current) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-step-card]');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: `+=${cards.length * 90}%`,
          pin: true,
          scrub: 0.6,
        },
      });
      cards.forEach((card, i) => {
        if (i === 0) return;
        tl.fromTo(
          card,
          { yPercent: 120, rotate: i % 2 ? 3 : -3 },
          { yPercent: i * 4, rotate: 0, ease: 'power2.out' },
        ).to(cards[i - 1], { scale: 0.94, opacity: 0.45, ease: 'power2.out' }, '<');
      });
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <section ref={wrap} className="relative py-28 md:min-h-screen md:flex md:flex-col md:justify-center overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-600/8 rounded-full blur-[120px]" aria-hidden />
      <SectionHeading
        tag="How it works"
        title="Your money, on autopilot"
        sub="Three moments define Savorah: capture, understand, grow. No spreadsheets, no manual entry marathons."
      />
      <div className="relative max-w-3xl mx-auto px-4 w-full md:h-[26rem]">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            data-step-card
            className={`md:absolute md:inset-x-4 md:top-0 glass-strong card-ring rounded-3xl p-8 md:p-10 mb-6 md:mb-0 bg-gradient-to-br ${s.accent} to-transparent`}
            style={{ zIndex: i + 1 }}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center">
                <s.icon className="w-6 h-6 text-emerald-300" />
              </div>
              <span className="px-3 py-1.5 rounded-full glass text-xs font-semibold text-mist-300">
                0{i + 1} · {s.chip}
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3">{s.title}</h3>
            <p className="text-mist-500 leading-relaxed md:text-lg">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ================================================================== */
/* Feature bento                                                       */
/* ================================================================== */

const FEATURES = [
  {
    icon: MessageSquareText,
    title: 'AI Coach that knows your numbers',
    desc: 'Chat with a coach grounded in your real transactions, budgets and goals — streaming answers, in your language, about your money.',
    span: 'md:col-span-2',
    glow: 'bg-emerald-500/15',
  },
  {
    icon: ScanLine,
    title: 'Receipt & statement OCR',
    desc: 'Photos and PDFs become clean, categorized transactions.',
    span: '',
    glow: 'bg-indigo-500/15',
  },
  {
    icon: MessageCircle,
    title: 'SMS parsing',
    desc: 'Paste any bank alert. Savorah extracts the transaction instantly.',
    span: '',
    glow: 'bg-teal-500/15',
  },
  {
    icon: PieChart,
    title: 'Living budgets',
    desc: 'Category budgets with real-time spend tracking, overspend alerts, and one-tap AI rebalancing when life changes.',
    span: 'md:col-span-2',
    glow: 'bg-amber-500/15',
  },
  {
    icon: Target,
    title: 'Goals with momentum',
    desc: 'Emergency funds, trips, gadgets — tracked visually, celebrated loudly.',
    span: '',
    glow: 'bg-rose-500/15',
  },
  {
    icon: LineChart,
    title: 'Analytics that explain themselves',
    desc: 'Trends, category breakdowns and monthly AI reports written in plain language.',
    span: '',
    glow: 'bg-sky-500/15',
  },
  {
    icon: Bell,
    title: 'Smart notifications',
    desc: 'Budget breaches, goal milestones and insights — only when they matter.',
    span: '',
    glow: 'bg-violet-500/15',
  },
];

const FeatureBento: React.FC = () => (
  <section id="features" className="relative py-28">
    <SectionHeading
      tag="Features"
      title="Everything a money app should be"
      sub="Every feature works together, powered by the same AI brain that understands your complete financial picture."
    />
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-5">
      {FEATURES.map((f, i) => (
        <Reveal key={f.title} delay={(i % 3) * 0.08} className={f.span}>
          <TiltCard max={5} className="h-full">
            <div className="group relative h-full glass rounded-3xl p-7 overflow-hidden transition-colors duration-500 hover:border-white/20">
              <div
                className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${f.glow}`}
                aria-hidden
              />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <f.icon className="w-5.5 h-5.5 text-emerald-300" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2.5">{f.title}</h3>
                <p className="text-mist-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          </TiltCard>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ================================================================== */
/* Personas                                                            */
/* ================================================================== */

const PERSONAS = [
  {
    id: 'student',
    icon: GraduationCap,
    name: 'Student',
    tagline: 'Stretch every rupee',
    desc: 'Pocket-money budgeting, hostel-life categories, and a coach that speaks your language about mess bills and weekend plans.',
    color: 'text-teal-300',
    ring: 'group-hover:border-teal-400/40',
    bg: 'from-teal-500/15',
    dot: 'bg-teal-400',
  },
  {
    id: 'professional',
    icon: Briefcase,
    name: 'Professional',
    tagline: 'Optimize and invest',
    desc: 'Salary-cycle budgets, SIP and rent tracking, savings-rate optimization, and insights tuned for career growth.',
    color: 'text-emerald-300',
    ring: 'group-hover:border-emerald-400/40',
    bg: 'from-emerald-500/15',
    dot: 'bg-emerald-400',
  },
  {
    id: 'family',
    icon: Users,
    name: 'Family',
    tagline: 'Plan for everyone',
    desc: 'Household budgets, school fees and grocery patterns, emergency funds, and goals the whole family can see grow.',
    color: 'text-amber-300',
    ring: 'group-hover:border-amber-400/40',
    bg: 'from-amber-500/15',
    dot: 'bg-amber-400',
  },
  {
    id: 'senior',
    icon: Heart,
    name: 'Senior',
    tagline: 'Peace of mind',
    desc: 'Larger text, simpler flows, pension and medical tracking, and gentle guidance without the jargon.',
    color: 'text-violet-300',
    ring: 'group-hover:border-violet-400/40',
    bg: 'from-violet-500/15',
    dot: 'bg-violet-400',
  },
];

const PersonaShowcase: React.FC = () => (
  <section id="personas" className="relative py-28 overflow-hidden">
    <div className="absolute bottom-0 left-1/4 w-[36rem] h-[36rem] bg-violet-600/8 rounded-full blur-[130px]" aria-hidden />
    <SectionHeading
      tag="Adaptive personas"
      title="One app, four lives"
      sub="Savorah reshapes itself — dashboard, budgets, AI tone and onboarding — around who you are, not just what you earn."
    />
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {PERSONAS.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.1}>
          <div
            className={`group relative glass rounded-3xl p-7 h-full overflow-hidden border transition-all duration-500 ${p.ring} hover:-translate-y-2`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${p.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} aria-hidden />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <p.icon className={`w-6.5 h-6.5 ${p.color}`} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                <p className={`text-xs font-bold uppercase tracking-widest ${p.color}`}>{p.tagline}</p>
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">{p.name}</h3>
              <p className="text-mist-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ================================================================== */
/* AI Coach preview (typing loop)                                      */
/* ================================================================== */

const CHAT_LOOP = [
  { q: 'Can I afford a ₹35,000 trip to Goa in December?', a: 'Yes — if you trim dining out by ₹2,500/month starting now, you\u2019ll have ₹36,400 saved by Dec 1 without touching your emergency fund.' },
  { q: 'Where did most of my money go last month?', a: 'Groceries & Dining took 34% (₹11,220). That\u2019s ₹1,800 over budget — mostly weekend food delivery. Want me to set a gentle cap?' },
  { q: 'How is my financial health overall?', a: 'Strong: 82/100. Savings rate is 24%, all bills on time. Your one gap: no medical emergency buffer. I\u2019d start with ₹1,500/month.' },
];

const AICoachSection: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'question' | 'typing' | 'done'>('question');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setTyped(CHAT_LOOP[idx].a);
      setPhase('done');
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'question') {
      timer = setTimeout(() => setPhase('typing'), 1400);
    } else if (phase === 'typing') {
      const full = CHAT_LOOP[idx].a;
      if (typed.length < full.length) {
        timer = setTimeout(() => setTyped(full.slice(0, typed.length + 2)), 18);
      } else {
        timer = setTimeout(() => setPhase('done'), 2600);
      }
    } else {
      timer = setTimeout(() => {
        setTyped('');
        setIdx((i) => (i + 1) % CHAT_LOOP.length);
        setPhase('question');
      }, 400);
    }
    return () => clearTimeout(timer);
  }, [phase, typed, idx, reduced]);

  return (
    <section id="ai" className="relative py-28 overflow-hidden">
      <div className="absolute top-1/4 -right-40 w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[130px]" aria-hidden />
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Reveal>
            <SectionTag>AI Coach</SectionTag>
          </Reveal>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mt-6 leading-[1.05]">
            <SplitWords text="A coach that has actually read your statements" />
          </h2>
          <Reveal delay={0.15}>
            <p className="text-mist-500 text-lg mt-6 leading-relaxed">
              Not generic advice. Savorah\u2019s coach is grounded in your live transactions, budgets and goals —
              so every answer is specific, actionable and in rupees.
            </p>
          </Reveal>
          <div className="mt-8 space-y-4">
            {[
              { icon: Zap, text: 'Streaming responses with real-time typing' },
              { icon: Wallet, text: 'Answers cite your actual spending data' },
              { icon: Sparkles, text: 'Proactive insights, monthly AI reports & health score' },
            ].map((item, i) => (
              <Reveal key={item.text} delay={0.2 + i * 0.1}>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
                    <item.icon className="w-4.5 h-4.5 text-emerald-300" />
                  </div>
                  <p className="text-mist-300 text-sm md:text-base">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1}>
          <TiltCard max={5}>
            <div className="glass-strong card-ring rounded-3xl p-6 min-h-[24rem] flex flex-col">
              <div className="flex items-center gap-3 pb-4 border-b hairline mb-5">
                <div className="w-10 h-10 rounded-xl btn-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Savorah Coach</p>
                  <p className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Grounded in your data
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`q-${idx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm bg-white/10 border border-white/10">
                      {CHAT_LOOP[idx].q}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {phase !== 'question' && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg btn-accent flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 text-sm glass text-mist-100 leading-relaxed">
                      {typed}
                      {phase === 'typing' && <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-2 mt-5 pt-4 border-t hairline overflow-hidden">
                {['Monthly report', 'Can I afford…', 'Cut my spending'].map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full glass text-[11px] text-mist-300 whitespace-nowrap">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
};

/* ================================================================== */
/* Analytics preview                                                   */
/* ================================================================== */

const AnalyticsPreview: React.FC = () => (
  <section className="relative py-28">
    <SectionHeading
      tag="Analytics"
      title="See the story behind the spending"
      sub="Category breakdowns, monthly trends, essential-vs-lifestyle splits — and an AI report that reads it all for you."
    />
    <div className="max-w-5xl mx-auto px-4">
      <Reveal>
        <TiltCard max={4}>
          <div className="glass-strong card-ring rounded-3xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl" aria-hidden />
            <div className="grid md:grid-cols-5 gap-8 relative">
              <div className="md:col-span-3">
                <p className="text-xs uppercase tracking-widest text-mist-500 font-semibold mb-6">Spending by category</p>
                <div className="space-y-4">
                  {[
                    { name: 'Housing & Rent', pct: 82, amt: '₹15,000', color: 'bg-emerald-400' },
                    { name: 'Groceries & Dining', pct: 64, amt: '₹9,800', color: 'bg-teal-400' },
                    { name: 'Transport', pct: 41, amt: '₹3,400', color: 'bg-sky-400' },
                    { name: 'Entertainment', pct: 88, amt: '₹4,300', color: 'bg-amber-400' },
                    { name: 'Shopping', pct: 33, amt: '₹2,100', color: 'bg-violet-400' },
                  ].map((c, i) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-mist-300">{c.name}</span>
                        <span className="font-semibold">{c.amt}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${c.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${c.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="glass rounded-2xl p-5 flex-1">
                  <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">Savings rate</p>
                  <p className="font-display text-4xl font-bold mt-2 accent-text">
                    <Counter value={24} suffix="%" />
                  </p>
                  <p className="text-xs text-mist-500 mt-2">↑ 6 points vs last month</p>
                </div>
                <div className="glass rounded-2xl p-5 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">AI monthly report</p>
                  </div>
                  <p className="text-sm text-mist-300 leading-relaxed">
                    “Entertainment is nearing its cap. Redirecting ₹1,200 keeps your Goa goal on schedule.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </Reveal>
    </div>
  </section>
);

/* ================================================================== */
/* Security                                                            */
/* ================================================================== */

const SecuritySection: React.FC = () => (
  <section id="security" className="relative py-28 overflow-hidden">
    <div className="absolute inset-0 grid-fade opacity-50" aria-hidden />
    <SectionHeading
      tag="Security"
      title="Your data, treated like money"
      sub="Bank-grade practices from day one. Your financial data is yours — encrypted, isolated, never sold."
    />
    <div className="max-w-5xl mx-auto px-4 grid sm:grid-cols-3 gap-5 relative">
      {[
        { icon: Lock, title: 'Encrypted sessions', desc: 'JWT-secured authentication with bcrypt-hashed credentials. Every API call is verified.' },
        { icon: ShieldCheck, title: 'Isolated by design', desc: 'Your transactions, budgets and goals are scoped to your account at the database level.' },
        { icon: Fingerprint, title: 'You stay in control', desc: 'Export, reset or delete your data anytime. AI processing is transient — nothing is used to train models.' },
      ].map((s, i) => (
        <Reveal key={s.title} delay={i * 0.1}>
          <div className="glass rounded-3xl p-7 h-full text-center hover:border-emerald-400/25 transition-colors duration-500">
            <div className="w-14 h-14 mx-auto rounded-2xl btn-accent flex items-center justify-center mb-5">
              <s.icon className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2.5">{s.title}</h3>
            <p className="text-mist-500 text-sm leading-relaxed">{s.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ================================================================== */
/* Testimonials                                                        */
/* ================================================================== */

const TESTIMONIALS = [
  { name: 'Ananya S.', role: 'Design student, Pune', text: 'I paste my bank SMS and it just… becomes a transaction. My hostel budget finally survives the month.' },
  { name: 'Rahul M.', role: 'Software engineer, Bengaluru', text: 'The coach told me exactly which subscription to cut to hit my bike goal 2 months early. Felt like magic.' },
  { name: 'Priya & Arjun', role: 'Parents of two, Delhi', text: 'School fees, groceries, the works — one dashboard the whole family understands. The alerts alone are worth it.' },
  { name: 'Col. Mehta (Retd.)', role: 'Senior citizen, Chandigarh', text: 'Large text, simple screens, no jargon. It tracks my pension and reminds me about medicines budget.' },
  { name: 'Sneha K.', role: 'CA, Mumbai', text: 'Statement import parsed 3 months of transactions flawlessly. The duplicate detection is genuinely smart.' },
  { name: 'Dev P.', role: 'Freelancer, Goa', text: 'Irregular income used to wreck my budgets. Savorah adapts each month. Best finance app I\u2019ve used.' },
];

const Testimonials: React.FC = () => (
  <section className="relative py-28 overflow-hidden">
    <SectionHeading tag="Loved across India" title="Real people, real progress" />
    <div className="space-y-5" aria-label="User testimonials">
      {[0, 1].map((row) => (
        <div key={row} className="flex overflow-hidden group" style={{ maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}>
          <div
            className="flex gap-5 shrink-0 animate-marquee group-hover:[animation-play-state:paused] pr-5"
            style={{ animationDirection: row === 1 ? 'reverse' : 'normal', animationDuration: row === 1 ? '48s' : '40s' }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="w-[22rem] shrink-0 glass rounded-3xl p-6">
                <p className="text-sm text-mist-100 leading-relaxed mb-5">“{t.text}”</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full btn-accent flex items-center justify-center text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-mist-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ================================================================== */
/* Free forever                                                        */
/* ================================================================== */

const FREE_INCLUDES = [
  'Unlimited transactions',
  'AI auto-categorization',
  'Budgets & savings goals',
  'SMS, receipt & statement import',
  'Unlimited AI Coach chats',
  'Monthly AI reports & health score',
  'All four adaptive personas',
  'Light & dark mode',
];

const FreeForever: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <section id="pricing" className="relative py-28">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] bg-emerald-600/8 rounded-full blur-[130px]" aria-hidden />
    <SectionHeading
      tag="Pricing"
      title="Free. Every feature, forever."
      sub="Savorah is completely free — no tiers, no trials, no card. Everything the AI can do is yours from day one."
    />
    <div className="max-w-3xl mx-auto px-4">
      <Reveal>
        <div className="relative glass-strong card-ring rounded-3xl p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full btn-accent text-[11px] font-bold uppercase tracking-widest mb-6">
              100% free
            </span>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="font-display text-6xl md:text-7xl font-bold">₹0</span>
              <span className="text-mist-500 text-lg">/ forever</span>
            </div>
            <p className="text-mist-500 max-w-md mx-auto mb-8">
              No hidden costs. No premium wall. Just powerful, AI-native personal finance for everyone in India.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-9">
              {FREE_INCLUDES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-mist-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <Magnetic strength={0.3}>
              <button
                onClick={onGetStarted}
                className="btn-accent px-9 py-4 rounded-2xl text-base font-bold inline-flex items-center gap-2"
              >
                Get started free <ArrowRight className="w-5 h-5" />
              </button>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ================================================================== */
/* FAQ                                                                 */
/* ================================================================== */

const FAQS = [
  { q: 'Is my banking data safe with Savorah?', a: 'Yes. You never link bank credentials — you import via SMS, receipts or statements you choose to share. Everything is encrypted, scoped to your account, and never sold or used to train AI models.' },
  { q: 'How accurate is the AI parsing?', a: 'Very. We chain multiple state-of-the-art models with automatic fallbacks, validate every extraction, and flag duplicates before they enter your ledger. You always review before anything is saved.' },
  { q: 'Does it work with Indian banks and UPI?', a: 'Savorah is India-first: it understands SMS formats from major Indian banks, UPI transaction messages, ₹-denominated statements, and formats every number in Indian notation.' },
  { q: 'What makes personas different from themes?', a: 'Personas change substance, not just colors — budget templates, AI coaching tone, dashboard priorities, and onboarding all adapt to students, professionals, families, and seniors.' },
  { q: 'Is Savorah really free?', a: 'Completely. Every feature — unlimited transactions, budgets, goals, SMS/receipt/statement import, and unlimited AI Coach chats — is free forever. No tiers, no trial, no card required.' },
];

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-28">
      <SectionHeading tag="FAQ" title="Questions, answered" />
      <div className="max-w-2xl mx-auto px-4 space-y-3">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.05}>
            <div className={`glass rounded-2xl overflow-hidden transition-colors ${open === i ? 'border-emerald-400/25' : ''}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-sm md:text-base">{f.q}</span>
                <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-5 h-5 text-mist-500 shrink-0" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-6 pb-5 text-sm text-mist-500 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ================================================================== */
/* Final CTA + footer                                                  */
/* ================================================================== */

const FinalCTA: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <section className="relative py-32 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div className="w-[60rem] h-[60rem] rounded-full bg-emerald-600/15 blur-[150px] animate-aurora" />
    </div>
    <div className="relative max-w-3xl mx-auto px-4 text-center">
      <Reveal>
        <div className="w-16 h-16 mx-auto rounded-2xl btn-accent flex items-center justify-center mb-8 animate-float">
          <IndianRupee className="w-7 h-7" strokeWidth={2.6} />
        </div>
      </Reveal>
      <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.02]">
        <SplitWords text="Your future self is waiting." />
      </h2>
      <Reveal delay={0.2}>
        <p className="text-mist-500 text-lg mt-6 max-w-xl mx-auto">
          Join Savorah today. Sixty seconds to set up, a lifetime of clarity.
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <div className="mt-10 flex justify-center">
          <Magnetic strength={0.35}>
            <button
              onClick={onGetStarted}
              className="btn-accent px-10 py-5 rounded-2xl text-lg font-bold flex items-center gap-2.5"
            >
              Get started free <ArrowUpRight className="w-5 h-5" />
            </button>
          </Magnetic>
        </div>
      </Reveal>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="border-t hairline py-14">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
        <div className="max-w-xs">
          <Logo size={34} wordmarkClassName="text-lg" />
          <p className="text-mist-500 text-sm mt-4 leading-relaxed">
            {SITE.tagline} AI-native personal finance for India — free, forever.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Savorah on Instagram"
              className="w-9 h-9 rounded-xl glass hover:bg-white/8 flex items-center justify-center text-mist-300 hover:text-white transition-colors"
            >
              <Instagram className="w-4.5 h-4.5" />
            </a>
            <a
              href={`mailto:${SITE.supportEmail}`}
              aria-label="Email Savorah support"
              className="w-9 h-9 rounded-xl glass hover:bg-white/8 flex items-center justify-center text-mist-300 hover:text-white transition-colors"
            >
              <Mail className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-semibold text-mist-100 mb-3">Product</p>
            <ul className="space-y-2.5 text-mist-500">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#personas" className="hover:text-white transition-colors">Personas</a></li>
              <li><a href="#ai" className="hover:text-white transition-colors">AI Coach</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-mist-100 mb-3">Company</p>
            <ul className="space-y-2.5 text-mist-500">
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">It's free</a></li>
              <li>
                <a href={SITE.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-mist-100 mb-3">Support</p>
            <ul className="space-y-2.5 text-mist-500">
              <li>
                <a href={`mailto:${SITE.supportEmail}`} className="hover:text-white transition-colors break-all">
                  {SITE.supportEmail}
                </a>
              </li>
              <li>
                <a href={SITE.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  {SITE.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t hairline flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-mist-500">© {new Date().getFullYear()} Savorah. Made in India.</p>
        <p className="text-xs text-mist-500">Free forever · No card required</p>
      </div>
    </div>
  </footer>
);

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setAuthModalOpen, setAuthMode } = useAuth();
  const reduced = useReducedMotion();

  useEffect(() => {
    document.title = 'Savorah — AI Personal Finance for Every Life Stage';
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.05 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reduced]);

  const goToApp = (mode: 'login' | 'signup') => {
    if (!currentUser) {
      setAuthMode(mode);
      setAuthModalOpen(true);
    }
    navigate('/app');
  };

  return (
    <div className="bg-ink-950 text-mist-100 min-h-screen antialiased">
      <LandingNav onGetStarted={() => goToApp('signup')} onSignIn={() => goToApp('login')} />
      <main>
        <Hero onGetStarted={() => goToApp('signup')} />
        <StatsStrip />
        <HowItWorks />
        <FeatureBento />
        <PersonaShowcase />
        <AICoachSection />
        <AnalyticsPreview />
        <SecuritySection />
        <Testimonials />
        <FreeForever onGetStarted={() => goToApp('signup')} />
        <FAQ />
        <FinalCTA onGetStarted={() => goToApp('signup')} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
