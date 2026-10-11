import React, { useEffect, useMemo, useState } from "react";
import type { LocalAccount } from "@/lib/auth";
import { calculateRisk, type RiskInput, type RiskResult } from "@/lib/personalization";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  Droplets,
  Dumbbell,
  FileText,
  HeartPulse,
  Info,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  NotebookPen,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Target,
  TrendingUp,
  UserRound,
  X,
  Zap,
  MessageCircle,
  Send,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type LogEntry = {
  id: number;
  date: string;
  cycleLength: number;
  mood: number;
  symptoms: string[];
  sleep: number;
  exercise: string;
  flow: string;
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "companion", label: "Talk to Siya", icon: MessageCircle },
  { id: "cycle", label: "Cycle log", icon: CalendarDays },
  { id: "risk", label: "Risk assessment", icon: Activity },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "nutrition", label: "Nutrition & mood", icon: Leaf },
  { id: "reports", label: "Reports", icon: FileText },
];

const cycleTrend = [
  { month: "Jan", days: 30 },
  { month: "Feb", days: 32 },
  { month: "Mar", days: 29 },
  { month: "Apr", days: 35 },
  { month: "May", days: 31 },
  { month: "Jun", days: 33 },
  { month: "Jul", days: 32 },
  { month: "Aug", days: 34 },
];

const moodTrend = [
  { day: "01", mood: 7, phase: "Follicular" },
  { day: "05", mood: 8, phase: "Follicular" },
  { day: "09", mood: 7, phase: "Ovulatory" },
  { day: "13", mood: 6, phase: "Luteal" },
  { day: "17", mood: 5, phase: "Luteal" },
  { day: "21", mood: 6, phase: "Menstrual" },
  { day: "25", mood: 8, phase: "Follicular" },
  { day: "29", mood: 8, phase: "Follicular" },
];

const initialLogs: LogEntry[] = [
  { id: 1, date: "2026-08-18", cycleLength: 34, mood: 7, symptoms: ["Fatigue", "Bloating"], sleep: 7.5, exercise: "2–3 days", flow: "Moderate" },
  { id: 2, date: "2026-07-15", cycleLength: 32, mood: 8, symptoms: ["Acne"], sleep: 8, exercise: "4+ days", flow: "Light" },
  { id: 3, date: "2026-06-13", cycleLength: 33, mood: 6, symptoms: ["Cramps", "Mood changes"], sleep: 6.5, exercise: "2–3 days", flow: "Moderate" },
  { id: 4, date: "2026-05-11", cycleLength: 31, mood: 7, symptoms: ["Fatigue"], sleep: 7, exercise: "1 day", flow: "Moderate" },
];

const initialRisk: RiskInput = {
  age: 24,
  bmi: 25.6,
  cycleLength: 34,
  regularity: "somewhat-irregular",
  lastPeriodDate: "2026-09-17",
  hirsutism: 2,
  acne: 2,
  weightGain: 1,
  hairLoss: 1,
  skinDarkening: 1,
  fastFood: 2,
  sleepHours: 7.5,
  stressLevel: 5,
  dietType: "moderate",
  exercise: 3,
  familyHistory: 0,
  familyDiabetes: 0,
  amh: null,
  lhFsh: null,
  fastingInsulin: null,
  testosterone: null,
  postPill: false,
  fatigue: 1,
  jointPain: 0,
  folliclesLeft: 9,
  folliclesRight: 11,
};

const emptyLog: LogEntry = { id: 0, date: "2026-09-17", cycleLength: 28, mood: 7, symptoms: [], sleep: 7, exercise: "Rest day", flow: "Moderate" };

const modelMetrics = [
  { metric: "Accuracy", logistic: "84%", forest: "89%" },
  { metric: "Precision", logistic: "81%", forest: "87%" },
  { metric: "Recall", logistic: "78%", forest: "86%" },
  { metric: "F1-score", logistic: "79%", forest: "86%" },
  { metric: "ROC-AUC", logistic: "0.88", forest: "0.93" },
];

function formatDate(date: string) {
  const parsed = new Date(`${date || ""}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function validDateInput(value: unknown, fallback: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? fallback : value;
}

function SectionHeader({ eyebrow, title, description, quote, action }: { eyebrow: string; title: string; description: string; quote?: { text: string; by: string }; action?: React.ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
        {quote && <div className="daily-quote"><Sparkles size={14} /><div><strong>“{quote.text}”</strong><span>{quote.by}</span></div></div>}
      </div>
      {action}
    </div>
  );
}

function StatusPill({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "gold" | "rose" | "berry" }) {
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{children}</span>;
}

function MetricCard({ icon: Icon, label, value, helper, tone }: { icon: React.ElementType; label: string; value: string; helper: string; tone: string }) {
  return (
    <div className={`metric-card ${tone}`}>
      <div className="metric-icon"><Icon size={18} strokeWidth={2.2} /></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-helper">{helper}</div>
    </div>
  );
}

function RiskRing({ score }: { score: number }) {
  return (
    <div className="risk-ring" style={{ "--progress": `${score * 3.6}deg` } as React.CSSProperties}>
      <div className="risk-ring-inner"><strong>{score}%</strong><span>estimated</span></div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><strong>{label}</strong><span>{payload[0].value} days</span></div>;
}

const dailyQuotes = [
  { text: "You are allowed to be a work in progress and still be worthy of tenderness.", by: "Siya’s note for today" },
  { text: "Your body is not a problem to solve. She is a home to listen to.", by: "A gentle reminder" },
  { text: "Even on the days you feel behind, you are still becoming someone beautiful.", by: "For your softer days" },
  { text: "You do not have to earn rest, care, love, or a fresh start.", by: "Siya’s note for today" },
  { text: "The way you keep showing up — quietly, imperfectly, honestly — is brave.", by: "For the girlies figuring it out" },
  { text: "You are more than a number, a symptom, a cycle, or a difficult day.", by: "A little truth for today" },
  { text: "Let today be small and kind. Small and kind still counts as moving forward.", by: "Siya’s note for today" },
];

function getDailyQuote(date: Date) {
  return dailyQuotes[Math.floor(date.getTime() / 86400000) % dailyQuotes.length];
}

function getTimeWelcome(hour: number, name: string) {
  if (hour < 5) return { title: "Hey, late-night girlie", copy: "The world can wait. A little rest and a little self-kindness are enough for tonight." };
  if (hour < 12) return { title: `Good morning, ${name}`, copy: "A clearer view of your rhythm starts here. Here's your latest health snapshot." };
  if (hour < 17) return { title: `Hey there, ${name}`, copy: "You're doing better than you think. Here's your latest health snapshot for the day." };
  if (hour < 22) return { title: `Good evening, ${name}`, copy: "Take a breath, check in with yourself, and let your patterns guide you gently." };
  return { title: "Hey, late-night girlie", copy: "Before you wind down, here's a gentle look at the signals your body is sharing." };
}

function formatToday(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
}

function indiaDateInputValue(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Kolkata" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function cyclePhaseFromDate(lastPeriodDate: string, cycleLength: number) {
  const start = new Date(`${validDateInput(lastPeriodDate, indiaDateInputValue(new Date()))}T12:00:00`).getTime();
  const elapsed = Math.max(1, Math.floor((Date.now() - start) / 86400000) + 1);
  const day = Math.min(cycleLength || 28, elapsed);
  if (day <= 5) return "Menstrual phase";
  if (day <= 13) return "Follicular phase";
  if (day <= 16) return "Ovulatory phase";
  return "Luteal phase";
}

function riskInputsFromCycleLog(log: LogEntry, current: RiskInput): RiskInput {
  const symptoms = new Set(log.symptoms);
  const movementDays = log.exercise === "4+ days" ? 5 : log.exercise === "2–3 days" ? 2 : log.exercise === "1 day" ? 1 : 0;
  const regularity = log.cycleLength >= 36 ? "irregular" : log.cycleLength >= 32 ? "somewhat-irregular" : "regular";
  return {
    ...current,
    cycleLength: log.cycleLength,
    regularity,
    hirsutism: symptoms.has("Hirsutism") ? Math.max(current.hirsutism, 3) : current.hirsutism,
    acne: symptoms.has("Acne") ? Math.max(current.acne, 3) : current.acne,
    weightGain: symptoms.has("Weight change") ? Math.max(current.weightGain, 3) : current.weightGain,
    exercise: movementDays,
    skinDarkening: symptoms.has("Skin darkening") ? Math.max(current.skinDarkening, 2) : current.skinDarkening,
    hairLoss: symptoms.has("Hair loss") ? Math.max(current.hairLoss, 2) : current.hairLoss,
    fastFood: log.mood <= 4 ? Math.min(7, Math.max(current.fastFood, 3)) : current.fastFood,
    lastPeriodDate: log.date,
    sleepHours: log.sleep,
    stressLevel: log.mood <= 4 ? Math.max(current.stressLevel, 8) : current.stressLevel,
    fatigue: symptoms.has("Fatigue") ? Math.max(current.fatigue, 2) : current.fatigue,
    jointPain: current.jointPain,
  };
}

export default function Home({ account, onLogout }: { account: LocalAccount; onLogout: () => void }) {
  const userKey = account.id;
  const storageKey = (key: string) => `femcare-${key}-${userKey}`;
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(() => { try { return JSON.parse(window.localStorage.getItem(storageKey("logs")) || "[]") as LogEntry[]; } catch { return []; } });
  const [riskInput, setRiskInput] = useState<RiskInput>(() => { try { const stored = JSON.parse(window.localStorage.getItem(storageKey("risk-input")) || "null") as Partial<RiskInput> | null; return { ...initialRisk, ...(stored || {}), lastPeriodDate: validDateInput(stored?.lastPeriodDate, initialRisk.lastPeriodDate) }; } catch { return initialRisk; } });
  const [riskResult, setRiskResult] = useState(() => calculateRisk(riskInput));
  const [savedMessage, setSavedMessage] = useState("");
  useEffect(() => {
    setRiskResult(calculateRisk(riskInput));
    window.localStorage.setItem(storageKey("risk-input"), JSON.stringify(riskInput));
  }, [riskInput]);
  useEffect(() => {
    window.localStorage.setItem(storageKey("risk-profile"), JSON.stringify({ score: riskResult.score, type: riskResult.pcosType, label: riskResult.label, updatedAt: new Date().toISOString() }));
  }, [riskResult]);
  const today = new Date();
  const indiaHour = Number(new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(today));
  const timeWelcome = getTimeWelcome(indiaHour, account.name);
  const dateLabel = formatToday(today);
  const dailyQuote = getDailyQuote(today);
  const [logForm, setLogForm] = useState({ date: indiaDateInputValue(today), cycleLength: "33", mood: "7", symptoms: ["Fatigue"], sleep: "7.5", exercise: "2–3 days", flow: "Moderate" });

  const forecast = useMemo(() => {
    const lengths = logs.map((log) => log.cycleLength).slice(0, 6).reverse();
    const weights = lengths.map((_, index) => index + 1);
    const weighted = lengths.reduce((sum, length, index) => sum + length * weights[index], 0) / weights.reduce((sum, weight) => sum + weight, 0);
    const average = lengths.length ? Math.round(weighted) : 28;
    const variance = lengths.length ? lengths.reduce((sum, value) => sum + (value - average) ** 2, 0) / lengths.length : 0;
    return { lengths, average, irregular: Math.sqrt(variance) > 3.5 };
  }, [logs]);

  const dashboardChart = useMemo(() => [...cycleTrend.slice(-5), { month: "Sep", days: forecast.average }], [forecast.average]);

  const showSaved = (message: string) => {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(""), 2600);
  };

  const goTo = (id: string) => {
    setActivePage(id);
    setMobileNav(false);
  };

  const updateRisk = (field: keyof RiskInput, value: string | number | boolean | null) => {
    const nullable = ["amh", "lhFsh", "fastingInsulin", "testosterone"].includes(String(field));
    setRiskInput((current) => ({ ...current, [field]: nullable ? (value === null || value === "" ? null : Number(value)) : typeof value === "string" && !["regularity", "dietType"].includes(String(field)) ? Number(value) : value }));
  };

  const toggleSymptom = (symptom: string) => {
    setLogForm((current) => ({ ...current, symptoms: current.symptoms.includes(symptom) ? current.symptoms.filter((item) => item !== symptom) : [...current.symptoms, symptom] }));
  };

  const saveLog = (event: React.FormEvent) => {
    event.preventDefault();
    const entry: LogEntry = {
      id: Date.now(),
      date: logForm.date,
      cycleLength: Number(logForm.cycleLength),
      mood: Number(logForm.mood),
      symptoms: logForm.symptoms,
      sleep: Number(logForm.sleep),
      exercise: logForm.exercise,
      flow: logForm.flow,
    };
    setLogs((current) => { const next = [entry, ...current]; window.localStorage.setItem(storageKey("logs"), JSON.stringify(next)); return next; });
    setRiskInput((current) => riskInputsFromCycleLog(entry, current));
    showSaved("Cycle entry saved to your private timeline");
    goTo("dashboard");
  };

  const assessRisk = (event: React.FormEvent) => {
    event.preventDefault();
    setRiskResult(calculateRisk(riskInput));
    window.localStorage.setItem(storageKey("risk-input"), JSON.stringify(riskInput));
    showSaved("Risk estimate refreshed using the selected model");
  };

  const lastLog = logs[0] || emptyLog;
  const pageTitle = navItems.find((item) => item.id === activePage)?.label || "Dashboard";

  return (
    <div className={`app-shell ${darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark"><span>F</span><span className="brand-mark-dot" /></div>
          <div><div className="brand-name">FemCare <em>AI</em></div><div className="brand-tagline">your health, understood</div></div>
          <button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${activePage === id ? "active" : ""}`} onClick={() => goTo(id)}><Icon size={18} /><span>{label}</span>{activePage === id && <ChevronRight size={15} className="nav-chevron" />}</button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note"><div className="note-icon"><ShieldCheck size={17} /></div><div><strong>Your data stays yours</strong><p>Prototype data is stored locally in this browser.</p></div></div>
        <button className="profile-card" onClick={() => showSaved("Profile settings are ready for your next iteration")}><div className="avatar">{account.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div className="profile-copy"><strong>{account.name}</strong><span>Personal workspace</span></div><MoreHorizontal size={18} /></button>
        <button className="logout-button" onClick={onLogout}><LogOut size={14} /> Log out</button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions"><button className="top-icon icon-button" aria-label="Help"><CircleHelp size={18} /></button><button className="top-icon icon-button" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setDarkMode((value) => !value)}>{darkMode ? <SunMedium size={18} /> : <Moon size={18} />}<div className="notification-dot" /></button><div className="date-chip"><CalendarDays size={16} /> {dateLabel}</div></div>
        </header>

        {savedMessage && <div className="toast"><Check size={16} />{savedMessage}</div>}

        <div className="page-content">
          {activePage === "companion" && <Companion name={account.name} logs={logs} riskInput={riskInput} riskResult={riskResult} storageKey={storageKey("siya-chat")} />}
          {activePage === "dashboard" && <Dashboard quote={dailyQuote} goTo={goTo} riskResult={riskResult} riskInput={riskInput} lastLog={lastLog} forecast={forecast} chart={dashboardChart} logs={logs} greeting={timeWelcome.title} greetingCopy={timeWelcome.copy} dateLabel={dateLabel} />}
          {activePage === "cycle" && <CycleLog logForm={logForm} setLogForm={setLogForm} toggleSymptom={toggleSymptom} saveLog={saveLog} logs={logs} />}
          {activePage === "risk" && <RiskAssessment riskInput={riskInput} updateRisk={updateRisk} assessRisk={assessRisk} riskResult={riskResult} />}
          {activePage === "forecast" && <Forecast forecast={forecast} logs={logs} />}
          {activePage === "nutrition" && <NutritionMood logs={logs} riskInput={riskInput} riskResult={riskResult} storageKey={storageKey("exercise-preference")} />}
          {activePage === "reports" && <Reports name={account.name} logs={logs} riskInput={riskInput} riskResult={riskResult} forecast={forecast} />}
        </div>
      </main>
    </div>
  );
}

function Companion({ name, logs, riskInput, riskResult, storageKey }: { name: string; logs: LogEntry[]; riskInput: RiskInput; riskResult: RiskResult; storageKey: string }) {
  const latest = logs[0] || emptyLog;
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [{ from: "siya", text: "Hey girlie, I’m Siya. You can rant here — no fixing, no judgment, no pretending you’re fine. What’s sitting heavy today?" }];
    } catch { return [{ from: "siya", text: "Hey girlie, I’m Siya. You can rant here — no fixing, no judgment, no pretending you’re fine. What’s sitting heavy today?" }]; }
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const phase = latest.cycleLength > 35 ? "a variable cycle window" : "your current cycle rhythm";
  const moodNote = latest.mood <= 5 ? "I noticed your recent mood check-in felt low, so we can keep this soft and low-pressure." : latest.mood >= 8 ? "Your latest mood check-in sounded brighter — we can build on that little spark." : "We can meet you exactly where your mood is today.";
  const symptoms = latest.symptoms.length ? latest.symptoms.slice(0, 3).join(", ").toLowerCase() : "no symptoms logged yet";
  const context = `The user is ${name}. Latest logged cycle: ${latest.cycleLength} days (${phase}). Recent symptoms: ${symptoms}. Latest mood: ${latest.mood}/10. Current estimated PCOS risk rate: ${riskResult.score}% (${riskResult.label}), presented as awareness-only, not a diagnosis. Exercise frequency in latest log: ${latest.exercise}.`;
  const sendMessage = (text = input) => {
    const clean = text.trim();
    if (!clean || typing) return;
    const crisis = /(kill myself|suicide|self harm|hurt myself|don't want to live|end my life)/i.test(clean);
    const response = crisis
      ? "I’m really glad you told me. I can’t keep you safe on my own. Please contact local emergency services or a crisis helpline now, and if you can, tell someone you trust to stay with you. You deserve immediate, human support."
      : /risk|pcos|score/i.test(clean)
        ? `I can explain the estimate gently. Yours is currently ${riskResult.score}% — an awareness estimate, not a diagnosis. The biggest signals showing right now are ${riskResult.contributions.slice(0, 2).map((item) => item.label.toLowerCase()).join(" and ")}. A clinician is the right person to interpret what that means for you.`
        : `I hear you, ${name.split(" ")[0]}. ${moodNote} I’m keeping your latest check-in in mind — ${symptoms} — but you never have to explain everything perfectly. What part feels heaviest right now?`;
    setMessages((current) => [...current, { from: "you", text: clean }]);
    setInput(""); setTyping(true);
    window.setTimeout(() => { setMessages((current) => { const next = [...current, { from: "siya", text: response }]; window.localStorage.setItem(storageKey, JSON.stringify(next)); return next; }); setTyping(false); }, 620);
  };
  return <><SectionHeader eyebrow="Your soft place to land" title="Talk to Siya" description="A calm, cycle-aware check-in companion shaped by your own logged patterns — never a diagnosis, never a replacement for care." action={<StatusPill tone="rose"><MessageCircle size={13} /> Here with you</StatusPill>} /><div className="companion-layout"><div className="panel chat-panel"><div className="chat-head"><div className="siya-avatar">M</div><div><strong>Siya</strong><span>Personalized support for {name.split(" ")[0]}</span></div><span className="online-dot">online</span></div><div className="chat-context"><Sparkles size={14} /> I’m gently keeping your recent check-in in mind: {symptoms} · {latest.mood}/10 mood · {riskResult.score}% estimated PCOS risk rate.</div><div className="chat-messages">{messages.map((message, index) => <div className={`chat-bubble ${message.from}`} key={index}>{message.text}</div>)}{typing && <div className="chat-bubble siya typing-indicator"><span /><span /><span /></div>}</div><div className="quick-prompts">{["I’m feeling anxious about my next cycle", "Can you explain my risk score simply?", "I just want to talk"].map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>)}</div><div className="chat-compose"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder="Tell Siya what’s on your mind…" aria-label="Message Siya" /><button onClick={() => sendMessage()} aria-label="Send message"><Send size={17} /></button></div><p className="chat-disclaimer">This is a supportive companion, not a substitute for professional care.</p></div><div className="panel companion-note"><div className="motivation-spark"><Sparkles size={17} /></div><div className="eyebrow">A little boundary, with love</div><h3>Siya listens. Professionals diagnose.</h3><p>She can help you reflect, organize questions, and find a little comfort. She will not diagnose, prescribe, or give dosage advice.</p><div className="siya-values"><span><Check size={14} /> No shame</span><span><Check size={14} /> No comparison</span><span><Check size={14} /> Human help when needed</span></div></div></div></>;
}

function Dashboard({ quote, goTo, riskResult, riskInput, lastLog, forecast, chart, logs, greeting, greetingCopy, dateLabel }: { quote: { text: string; by: string }; goTo: (page: string) => void; riskResult: RiskResult; riskInput: RiskInput; lastLog: LogEntry; forecast: { average: number; irregular: boolean }; chart: { month: string; days: number }[]; logs: LogEntry[]; greeting: string; greetingCopy: string; dateLabel: string }) {
  const [water, setWater] = useState(0);
  const safeLastPeriodDate = validDateInput(riskInput.lastPeriodDate, indiaDateInputValue(new Date()));
  const phase = cyclePhaseFromDate(safeLastPeriodDate, lastLog.cycleLength);
  const nextPeriod = new Date(`${safeLastPeriodDate}T12:00:00`); nextPeriod.setDate(nextPeriod.getDate() + Math.max(21, Number(lastLog.cycleLength) || 28));
  const elapsedDays = Math.max(1, Math.floor((Date.now() - new Date(`${safeLastPeriodDate}T12:00:00`).getTime()) / 86400000) + 1);
  const tip = riskResult.pcosType === "Insulin-Resistant" ? "Pair your next roti or chawal meal with dal, paneer, tofu, or a bowl of sabzi." : riskResult.pcosType === "Adrenal" ? "Your stress signals are asking for softness today: choose one small task, then pause." : `Your ${phase.toLowerCase()} can guide your pace — consistency matters more than intensity.`;
  return <>
    <SectionHeader eyebrow={dateLabel} title={greeting} description={greetingCopy} quote={quote} action={<div className="dashboard-actions"><button className="soft-button" onClick={() => goTo("companion")}><MessageCircle size={16} /> Talk to Siya</button><button className="primary-button" onClick={() => goTo("cycle")}><Plus size={17} /> Log today's health</button></div>} />
    <div className="dashboard-grid-top">
      <div className="hero-card">
        <div className="hero-card-glow" />
        <div className="hero-card-content"><div className="hero-kicker"><span className="pulse-dot" /> Cycle day 23 <span className="kicker-divider" /> Luteal phase</div><h2>Your body is in a <span>reflective rhythm.</span></h2><p>Energy may feel a little softer this week. Small, consistent choices can support your next cycle.</p><button className="text-button" onClick={() => goTo("nutrition")}>Explore gentle guidance <ArrowUpRight size={15} /></button></div><div className="cycle-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-center"><Droplets size={22} /><strong>23</strong><span>day</span></div><span className="orbit-label label-top">Now</span><span className="orbit-label label-bottom">Sep 25</span></div>
      </div>
      <div className="insight-card"><div className="card-heading"><div><div className="eyebrow">Personal insight</div><h3>A pattern worth noticing</h3></div><Sparkles size={19} className="gold-icon" /></div><div className="insight-visual"><div className="insight-bar"><span style={{ height: "78%" }} /><span style={{ height: "64%" }} /><span style={{ height: "88%" }} /><span style={{ height: "70%" }} /><span style={{ height: "92%" }} /><span style={{ height: "75%" }} /></div><div className="insight-number"><strong>+3.2</strong><span>days variation</span></div></div><p>Your last 4 cycles show more variation than usual. It may be useful to mention this pattern at your next appointment.</p><button className="soft-button" onClick={() => goTo("forecast")}>View forecast <ChevronRight size={15} /></button></div>
    </div>

    <div className="dashboard-extras"><div className="extra-card phase-extra"><div className="extra-icon"><Droplets size={17} /></div><div><span>Today's cycle phase</span><strong>{phase}</strong><small>Day {Math.min(Number(lastLog.cycleLength) || 28, elapsedDays)}</small></div></div><div className="extra-card tip-extra"><div className="extra-icon"><Sparkles size={17} /></div><div><span>Siya's daily tip</span><strong>{tip}</strong></div></div><div className="extra-card water-extra"><div className="extra-icon"><Droplets size={17} /></div><div><span>Water today · goal 2.5L</span><strong>{water.toFixed(1)}L</strong><div className="water-controls"><button onClick={() => setWater((value) => Math.max(0, value - 0.25))}>−</button><button onClick={() => setWater((value) => Math.min(2.5, value + 0.25))}>+</button></div></div></div><div className="extra-card streak-extra"><div className="extra-icon"><Zap size={17} /></div><div><span>Symptom streak</span><strong>{Math.min(logs.length, 30)} day{Math.min(logs.length, 30) === 1 ? "" : "s"}</strong><small>{logs.length ? "You are building a useful pattern" : "Log today to begin"}</small></div></div></div><div className="metric-grid"><MetricCard icon={Droplets} label="Current cycle" value={`${lastLog.cycleLength} days`} helper={`Phase: ${phase}`} tone="berry" /><MetricCard icon={Target} label="PCOS risk rate" value={`${riskResult.score}%`} helper={`${riskResult.label} · estimated PCOS risk`} tone="rose" /><MetricCard icon={TrendingUp} label="Next period" value={formatDate(nextPeriod.toISOString().slice(0, 10))} helper={`~${forecast.average} days weighted forecast`} tone="gold" /><MetricCard icon={Moon} label="Sleep average" value={`${lastLog.sleep} hrs`} helper="From your latest check-in" tone="green" /></div>

    <div className="content-grid two-thirds"><div className="panel chart-panel"><div className="panel-heading"><div><div className="eyebrow">Cycle rhythm</div><h3>Your recent pattern</h3></div><button className="icon-button subtle" onClick={() => goTo("forecast")} aria-label="Open forecast"><ArrowUpRight size={17} /></button></div><div className="chart-legend"><span><i className="legend-swatch berry" /> Cycle length</span><span className="legend-note">Last 6 months</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={220}><AreaChart data={chart} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="cycleFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d2e46" stopOpacity={0.22} /><stop offset="100%" stopColor="#6d2e46" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eadfd7" strokeDasharray="4 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><YAxis domain={[24, 38]} axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="days" stroke="#6d2e46" strokeWidth={2.5} fill="url(#cycleFill)" dot={{ fill: "#6d2e46", strokeWidth: 3, stroke: "#fffaf7", r: 4 }} activeDot={{ r: 6 }} /></AreaChart></ResponsiveContainer></div><div className="chart-footer"><span><strong>32.5 days</strong> average cycle</span><StatusPill tone={forecast.irregular ? "gold" : "green"}>{forecast.irregular ? "Variable pattern" : "Stable pattern"}</StatusPill></div></div>
      <div className="panel"><div className="panel-heading"><div><div className="eyebrow">Latest assessment</div><h3>Risk overview</h3></div><StatusPill tone="gold">Prototype model</StatusPill></div><div className="risk-overview"><RiskRing score={riskResult.score} /><div className="risk-copy"><div className="risk-label">{riskResult.label} PCOS risk rate</div><p>Based on 14 self-reported signals and a synthetic training set. This is an estimated PCOS risk rate, not a diagnosis.</p><button className="text-button" onClick={() => goTo("risk")}>Review factors <ArrowUpRight size={15} /></button></div></div><div className="mini-factor-list">{riskResult.contributions.slice(0, 3).map((item) => <div className="mini-factor" key={item.label}><span>{item.label}</span><strong>+{item.value}%</strong></div>)}</div><div className="disclaimer"><Info size={14} /> This is a decision-support and awareness tool, not a medical diagnosis.</div></div></div>

    <div className="content-grid two-thirds bottom-grid"><div className="panel"><div className="panel-heading"><div><div className="eyebrow">Timeline</div><h3>Recent check-ins</h3></div><button className="soft-button compact" onClick={() => goTo("cycle")}>View cycle log <ChevronRight size={15} /></button></div><div className="timeline-list">{logs.slice(0, 3).map((log, index) => <div className="timeline-row" key={log.id}><div className={`timeline-icon ${index === 0 ? "current" : ""}`}><Droplets size={16} /></div><div className="timeline-copy"><strong>{index === 0 ? "Cycle started" : "Health check-in"}</strong><span>{formatDate(log.date)} · {log.symptoms.join(" · ")}</span></div><div className="timeline-value"><strong>{log.cycleLength}d</strong><span>cycle</span></div></div>)}</div></div><div className="quote-card"><div className="quote-mark">“</div><p>You don't need perfect data. You just need a few honest signals, tracked over time.</p><span>FemCare AI principle</span><div className="motivation-side"><strong>You are not behind.</strong><span>Your body is giving you information — and you are learning to listen.</span></div></div></div>
  </>;
}

function CycleLog({ logForm, setLogForm, toggleSymptom, saveLog, logs }: { logForm: any; setLogForm: React.Dispatch<React.SetStateAction<any>>; toggleSymptom: (symptom: string) => void; saveLog: (event: React.FormEvent) => void; logs: LogEntry[] }) {
  const symptoms = ["Cramps", "Mood changes", "Fatigue", "Bloating", "Acne", "Hirsutism", "Weight change", "Hair loss", "Skin darkening"];
  return <>
    <SectionHeader eyebrow="Your private timeline" title="Cycle log" description="Capture a few signals at a time. Your patterns become clearer as your timeline grows." action={<div className="privacy-badge"><ShieldCheck size={16} /> Private by default</div>} />
    <div className="log-layout"><form className="panel log-form" onSubmit={saveLog}><div className="panel-heading"><div><div className="eyebrow">New entry</div><h3>How are you feeling today?</h3></div><NotebookPen size={20} className="rose-icon" /></div><div className="form-grid"><label className="field"><span>Cycle start date</span><input type="date" value={logForm.date} onChange={(e) => setLogForm((current: any) => ({ ...current, date: e.target.value }))} /></label><label className="field"><span>Cycle length <small>days</small></span><input type="number" min="18" max="60" value={logForm.cycleLength} onChange={(e) => setLogForm((current: any) => ({ ...current, cycleLength: e.target.value }))} /></label></div><div className="field"><span>Symptoms today</span><div className="chip-grid">{symptoms.map((symptom) => <button type="button" key={symptom} className={`choice-chip ${logForm.symptoms.includes(symptom) ? "selected" : ""}`} onClick={() => toggleSymptom(symptom)}>{logForm.symptoms.includes(symptom) && <Check size={14} />}{symptom}</button>)}</div></div><div className="form-grid"><label className="field"><span>Mood <small>1–10</small></span><div className="range-row"><input type="range" min="1" max="10" value={logForm.mood} onChange={(e) => setLogForm((current: any) => ({ ...current, mood: e.target.value }))} /><strong>{logForm.mood}/10</strong></div></label><label className="field"><span>Sleep <small>hours</small></span><input type="number" min="0" max="14" step="0.5" value={logForm.sleep} onChange={(e) => setLogForm((current: any) => ({ ...current, sleep: e.target.value }))} /></label></div><div className="form-grid"><label className="field"><span>Movement</span><select value={logForm.exercise} onChange={(e) => setLogForm((current: any) => ({ ...current, exercise: e.target.value }))}><option>Rest day</option><option>1 day</option><option>2–3 days</option><option>4+ days</option></select></label><label className="field"><span>Flow</span><select value={logForm.flow} onChange={(e) => setLogForm((current: any) => ({ ...current, flow: e.target.value }))}><option>Light</option><option>Moderate</option><option>Heavy</option></select></label></div><button className="primary-button full-width" type="submit"><Plus size={17} /> Save health entry</button></form><div className="log-side"><div className="panel mini-calendar"><div className="panel-heading"><div><div className="eyebrow">September 2026</div><h3>Cycle map</h3></div><CalendarDays size={19} className="gold-icon" /></div><div className="calendar-week"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><div className="calendar-grid">{Array.from({ length: 30 }, (_, index) => <span key={index} className={`${index + 1 === 23 ? "today" : ""} ${index + 1 >= 20 && index + 1 <= 26 ? "luteal" : ""}`}>{index + 1}</span>)}</div><div className="calendar-key"><span><i className="dot berry-dot" /> Current phase</span><span><i className="dot today-dot" /> Today</span></div></div><div className="panel tracking-tip"><div className="tip-icon"><Sparkles size={17} /></div><div><strong>Small data, big picture</strong><p>One entry takes less than a minute. Regular check-ins help your trends feel more personal.</p></div></div></div></div>
    <div className="panel history-panel"><div className="panel-heading"><div><div className="eyebrow">Since May 2026</div><h3>Check-in history</h3></div><span className="muted-count">{logs.length} entries</span></div><div className="history-table"><div className="history-header"><span>Date</span><span>Cycle</span><span>Symptoms</span><span>Sleep</span><span>Movement</span><span /></div>{logs.map((log) => <div className="history-row" key={log.id}><span className="date-cell"><CalendarDays size={14} />{formatDate(log.date)}</span><strong>{log.cycleLength} days</strong><span className="symptom-summary">{log.symptoms.slice(0, 2).join(" · ")}</span><span>{log.sleep} hrs</span><span>{log.exercise}</span><button className="icon-button subtle" aria-label="More options"><MoreHorizontal size={16} /></button></div>)}</div></div>
  </>;
}

function RiskAssessment({ riskInput, updateRisk, assessRisk, riskResult }: { riskInput: RiskInput; updateRisk: (field: keyof RiskInput, value: string | number | boolean | null) => void; assessRisk: (event: React.FormEvent) => void; riskResult: RiskResult }) {
  const symptomFields: { key: keyof RiskInput; label: string }[] = [
    { key: "weightGain", label: "Unexplained weight gain" },
    { key: "acne", label: "Acne, especially jawline / chin" },
    { key: "hirsutism", label: "Facial or body hair" },
    { key: "hairLoss", label: "Hair thinning or scalp hair fall" },
    { key: "skinDarkening", label: "Skin darkening on neck / underarms" },
  ];
  const labFields: { key: keyof RiskInput; label: string }[] = [
    { key: "amh", label: "AMH level" }, { key: "lhFsh", label: "LH / FSH ratio" },
    { key: "fastingInsulin", label: "Fasting insulin" }, { key: "testosterone", label: "Testosterone" },
  ];
  const level = (key: keyof RiskInput) => Number(riskInput[key]) > 0;
  const toggle = (key: keyof RiskInput) => updateRisk(key, level(key) ? 0 : 3);
  const riskTone = riskResult.label === "Very High" || riskResult.label === "High" ? "rose" : riskResult.label === "Moderate" ? "gold" : "green";
  return <>
    <SectionHeader eyebrow="Pattern awareness" title="PCOS Risk Assessment" description="A transparent awareness estimate from the signals you choose to share — never a diagnosis." action={<StatusPill tone="green"><span className="status-dot" /> Model online</StatusPill>} />
    <div className="assessment-layout"><form className="panel assessment-form" onSubmit={assessRisk}>
      <div className="assessment-intro"><div className="intro-icon"><Activity size={20} /></div><div><strong>Build your personal snapshot</strong><p>Every field is optional apart from the basics. You can update it whenever your health changes.</p></div></div>
      <div className="field-section"><div className="subheading">Menstrual pattern</div><div className="form-grid three-col"><label className="field"><span>Cycle length<small>days</small></span><input type="number" min="18" max="60" value={riskInput.cycleLength} onChange={(e) => updateRisk("cycleLength", e.target.value)} /></label><label className="field"><span>Last period date</span><input type="date" value={riskInput.lastPeriodDate} onChange={(e) => updateRisk("lastPeriodDate", e.target.value)} /></label><label className="field"><span>BMI<small>optional context</small></span><input type="number" min="16" max="45" step="0.1" value={riskInput.bmi} onChange={(e) => updateRisk("bmi", e.target.value)} /></label></div><label className="field"><span>How irregular are your cycles?</span><select value={riskInput.regularity} onChange={(e) => updateRisk("regularity", e.target.value)}><option value="regular">Regular</option><option value="somewhat-irregular">Slightly irregular</option><option value="irregular">Very irregular</option><option value="no-period">No period</option></select></label></div>
      <div className="field-section"><div className="subheading">Physical symptoms <span>Select all that apply</span></div><div className="chip-grid risk-chip-grid">{symptomFields.map((field) => <button type="button" key={String(field.key)} className={`choice-chip ${level(field.key) ? "selected" : ""}`} onClick={() => toggle(field.key)}>{level(field.key) && <Check size={14} />}{field.label}</button>)}</div></div>
      <div className="field-section"><div className="subheading">Lifestyle</div><div className="form-grid two-col"><label className="field"><span>Sleep<small>{riskInput.sleepHours} hours / night</small></span><input type="range" min="4" max="10" step="0.5" value={riskInput.sleepHours} onChange={(e) => updateRisk("sleepHours", e.target.value)} /></label><label className="field"><span>Stress<small>{riskInput.stressLevel} / 10</small></span><input type="range" min="1" max="10" value={riskInput.stressLevel} onChange={(e) => updateRisk("stressLevel", e.target.value)} /></label></div><div className="form-grid two-col"><label className="field"><span>Diet type</span><select value={riskInput.dietType} onChange={(e) => updateRisk("dietType", e.target.value)}><option value="healthy">Healthy and balanced</option><option value="moderate">Moderate / mixed</option><option value="poor">High sugar and processed food</option></select></label><label className="field"><span>Exercise per week</span><select value={riskInput.exercise} onChange={(e) => updateRisk("exercise", e.target.value)}><option value="0">None</option><option value="2">1–2 days</option><option value="4">3–4 days</option><option value="7">Daily</option></select></label></div><label className="field"><span>Recently stopped contraceptive pill?</span><select value={riskInput.postPill ? "yes" : "no"} onChange={(e) => updateRisk("postPill", e.target.value === "yes")}><option value="no">No</option><option value="yes">Yes</option></select></label></div>
      <div className="field-section"><div className="subheading">Family history</div><div className="form-grid two-col"><label className="field"><span>Mother or sister has PCOS?</span><select value={riskInput.familyHistory} onChange={(e) => updateRisk("familyHistory", e.target.value)}><option value="0">No</option><option value="1">Yes</option><option value="2">Don't know</option></select></label><label className="field"><span>Family history of diabetes?</span><select value={riskInput.familyDiabetes} onChange={(e) => updateRisk("familyDiabetes", e.target.value)}><option value="0">No</option><option value="1">Yes</option><option value="2">Don't know</option></select></label></div></div>
      <div className="field-section"><div className="subheading">Lab values <span>Optional — skip anything you do not know</span></div><div className="form-grid two-col">{labFields.map((field) => <label className="field" key={String(field.key)}><span>{field.label}</span><input type="number" step="0.1" placeholder="Optional" value={String(riskInput[field.key] ?? "")} onChange={(e) => updateRisk(field.key, e.target.value === "" ? null : e.target.value)} /></label>)}</div></div>
      <button className="primary-button full-width" type="submit"><RefreshCcw size={17} /> Update PCOS risk rate</button><div className="disclaimer large"><Info size={15} /><span>This is a decision-support and awareness tool, not a medical diagnosis. A very high result means please consult a gynecologist.</span></div>
    </form><div className="assessment-result"><div className="panel result-card"><div className="panel-heading"><div><div className="eyebrow">Latest PCOS risk output</div><h3>PCOS risk rate</h3></div><StatusPill tone={riskTone}>{riskResult.label}</StatusPill></div><div className="result-ring-row"><RiskRing score={riskResult.score} /><div><div className="result-big-label">{riskResult.score}% · {riskResult.label} Risk</div><p>{riskResult.label === "Very High" ? "Please consult a gynecologist for professional interpretation." : "This is an awareness estimate based on the inputs you selected."}</p></div></div><div className="result-callout"><Zap size={17} /><span>PCOS pattern: <strong>{riskResult.pcosType}</strong></span></div><p className="type-explanation">{riskResult.typeExplanation}</p><div className="factor-heading"><div><div className="eyebrow">Explainable estimate</div><h4>What shaped this result?</h4></div><span>Top signals</span></div><div className="factor-bars">{riskResult.contributions.map((item) => <div className="factor-row" key={item.label}><div className="factor-meta"><span>{item.label}</span><strong>+{item.value}</strong></div><div className="factor-track"><div className={`factor-fill ${item.tone}`} style={{ width: `${Math.min(96, item.value * 2.2)}%` }} /></div></div>)}</div><p className="factor-note">Contributions are model explanations, not clinical conclusions.</p></div></div></div>
  </>;
}
function Forecast({ forecast, logs }: { forecast: { lengths: number[]; average: number; irregular: boolean }; logs: LogEntry[] }) {
  const data: { label: string; length: number | null; forecast: number | null }[] = [
    ...logs.slice(0, 6).reverse().map((log, index) => ({ label: `C${index + 1}`, length: log.cycleLength, forecast: null as number | null })),
    { label: "Next", length: null, forecast: forecast.average },
  ];
  return <>
    <SectionHeader eyebrow="Weighted moving average" title="Cycle forecast" description="A transparent estimate based on your most recent cycles — not a fixed 28-day assumption." action={<div className="method-chip"><TrendingUp size={15} /> Weighted · last {Math.min(6, logs.length)} cycles</div>} />
    <div className="forecast-hero"><div><div className="eyebrow">Your next cycle may arrive in</div><div className="forecast-number">~{forecast.average}<span> days</span></div><p>More weight is given to recent cycles so the estimate can adapt with you.</p><div className="forecast-formula"><span>weighted average</span><strong>{forecast.lengths.join(" + ")} → {forecast.average}d</strong></div></div><div className="forecast-orb"><div className="orb-line line-a" /><div className="orb-line line-b" /><div className="orb-core"><TrendingUp size={24} /><span>adaptive</span></div></div></div>
    <div className="content-grid two-thirds"><div className="panel chart-panel"><div className="panel-heading"><div><div className="eyebrow">Cycle length projection</div><h3>Recent rhythm & next estimate</h3></div><StatusPill tone="berry">Live from your log</StatusPill></div><div className="chart-wrap tall"><ResponsiveContainer width="100%" height={300}><LineChart data={data} margin={{ top: 12, right: 18, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#eadfd7" strokeDasharray="4 4" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><YAxis domain={[24, 40]} axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="length" stroke="#6d2e46" strokeWidth={3} dot={{ fill: "#6d2e46", stroke: "#fffaf7", strokeWidth: 3, r: 5 }} connectNulls={false} /><Line type="monotone" dataKey="forecast" stroke="#c98a3e" strokeDasharray="6 6" strokeWidth={3} dot={{ fill: "#c98a3e", stroke: "#fffaf7", strokeWidth: 3, r: 6 }} connectNulls={false} /></LineChart></ResponsiveContainer></div><div className="chart-footer"><span><i className="legend-swatch berry" /> Logged cycles</span><span><i className="legend-swatch gold" /> Forecast</span></div></div><div className="forecast-side"><div className={`panel irregular-card ${forecast.irregular ? "attention" : "good"}`}><div className="round-icon">{forecast.irregular ? <AlertCircle size={19} /> : <Check size={19} />}</div><div className="eyebrow">Pattern check</div><h3>{forecast.irregular ? "Irregular cycle pattern" : "A fairly steady pattern"}</h3><p>{forecast.irregular ? "Your recent cycle lengths vary by more than 4 days. This is an informational insight, not a diagnosis." : "Your recent cycle lengths are staying close together. Keep tracking to see how this evolves."}</p></div><div className="panel method-card"><div className="panel-heading"><div><div className="eyebrow">How it works</div><h3>Transparent by design</h3></div><BookOpen size={18} className="rose-icon" /></div><div className="method-steps"><div><span>01</span><p>Take your last 4–6 logged cycles.</p></div><div><span>02</span><p>Give recent cycles more weight.</p></div><div><span>03</span><p>Compare spread for variability.</p></div></div></div></div></div>
  </>;
}

function NutritionMood({ logs, riskInput, riskResult, storageKey }: { logs: LogEntry[]; riskInput: RiskInput; riskResult: RiskResult; storageKey: string }) {
  const latest = logs[0] || emptyLog;
  const moodAverage = logs.length ? (logs.reduce((sum, log) => sum + log.mood, 0) / logs.length).toFixed(1) : "—";
  const [exercisePreference, setExercisePreference] = useState(() => window.localStorage.getItem(storageKey) || "low-energy");
  const setExercise = (value: string) => { setExercisePreference(value); window.localStorage.setItem(storageKey, value); };
  const exerciseOptions = [{ id: "yoga", label: "Yoga", icon: "◒", copy: "Flow, breathwork, hip-openers, and restorative stretches." }, { id: "gym", label: "Gym", icon: "✦", copy: "Strength machines, moderate cardio, and confident progressive training." }, { id: "home", label: "Home workouts", icon: "⌂", copy: "Bodyweight strength, dance breaks, and short guided circuits." }, { id: "low-energy", label: "Low-energy", icon: "☾", copy: "Mobility, gentle walking, stretching, and guilt-free rest." }];
  const topFactor = riskResult.contributions[0]?.label || "your current signals";
  const planPhase = cyclePhaseFromDate(riskInput.lastPeriodDate, latest.cycleLength);
  const superfoods = riskResult.pcosType === "Insulin-Resistant" ? ["methi", "dal", "karela"] : riskResult.pcosType === "Adrenal" ? ["magnesium-rich pumpkin seeds", "spinach", "ashwagandha tea"] : riskResult.pcosType === "Inflammatory" ? ["haldi", "walnuts", "omega-3 foods"] : ["methi", "haldi", "seasonal vegetables"];
  const suggestions = riskInput.acne >= 3 || riskInput.weightGain >= 3 ? [{ icon: Leaf, tag: topFactor, title: "Build a lower-glycemic plate", copy: "Try dal, tofu or paneer, vegetables, nuts, and whole grains instead of sugary snacks alone.", tone: "green" }, { icon: Dumbbell, tag: "Metabolic support", title: "Add gentle strength", copy: "Two or three short resistance sessions can support energy and confidence without punishment.", tone: "berry" }, { icon: Moon, tag: "Recovery", title: "Give your skin and body rest", copy: "Hydration, sleep consistency, and a calming evening routine can support your next check-in.", tone: "gold" }] : riskInput.regularity !== "regular" ? [{ icon: Leaf, tag: topFactor, title: "Steady your plate", copy: "Pair protein, fiber, and healthy fats at regular meals to support energy around variable cycles.", tone: "green" }, { icon: Dumbbell, tag: "Cycle support", title: "Choose consistent movement", copy: "Try 20–30 minutes of walking or strength on most days, adjusting intensity to your energy.", tone: "berry" }, { icon: Moon, tag: latest.mood <= 5 ? "Low mood support" : "Rest rhythm", title: "Protect your wind-down", copy: "A predictable bedtime and a screen-light buffer can help when cycle variability feels tiring.", tone: "gold" }] : [{ icon: Leaf, tag: topFactor, title: "Build a colorful plate", copy: "Try leafy greens, berries, olive oil, and a protein-rich base for your next meal.", tone: "green" }, { icon: Dumbbell, tag: "Cycle support", title: "Move in a way that feels good", copy: "A walk, mobility flow, or light strength session can support energy without overreaching.", tone: "berry" }, { icon: Moon, tag: "Rest rhythm", title: "Protect your wind-down", copy: "A consistent bedtime and lower light in the last hour can help your sleep signals stay steady.", tone: "gold" }];
  return <>
    <SectionHeader eyebrow="Supportive, not prescriptive" title="My Plan" description="Simple rule-based guidance based on the signals you choose to track. Take what feels useful." action={<div className="method-chip"><Sparkles size={15} /> Gentle guidance</div>} />
    <div className="wellness-grid"><div className="panel mood-panel"><div className="panel-heading"><div><div className="eyebrow">Mood rhythm</div><h3>How your mood has moved</h3></div><div className="mood-score"><strong>{moodAverage}</strong><span>average / 10</span></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={230}><AreaChart data={moodTrend} margin={{ top: 12, right: 8, left: -25, bottom: 0 }}><defs><linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a26769" stopOpacity={0.25} /><stop offset="100%" stopColor="#a26769" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eadfd7" strokeDasharray="4 4" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><YAxis domain={[1, 10]} axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><Tooltip /><Area type="monotone" dataKey="mood" stroke="#a26769" strokeWidth={2.5} fill="url(#moodFill)" dot={{ fill: "#a26769", stroke: "#fffaf7", strokeWidth: 3, r: 4 }} /></AreaChart></ResponsiveContainer></div><div className="mood-insight"><div className="tip-icon"><Sparkles size={15} /></div><p>Your mood tends to dip slightly during the late luteal window, then lift again as your next cycle begins.</p></div></div><div className="panel phase-card"><div className="eyebrow">Today · day 23</div><h3>Luteal phase</h3><p>A softer season for your energy. Small routines may feel better than big pushes.</p><div className="phase-progress"><span style={{ width: "72%" }} /></div><div className="phase-meta"><span>Day 23</span><span>~5 days to next cycle</span></div><div className="phase-orbit-small"><div className="orbit-center"><Moon size={18} /><strong>72%</strong><span>through</span></div></div></div></div>
    <div className="suggestions-header"><div><div className="eyebrow">Based on your recent signals</div><h2>Three small ideas for today</h2></div><StatusPill tone="green">No diagnosis · just support</StatusPill></div><div className="suggestion-grid">{suggestions.map(({ icon: Icon, tag, title, copy, tone }) => <div className={`suggestion-card ${tone}`} key={title}><div className="suggestion-icon"><Icon size={19} /></div><div className="suggestion-tag">{tag}</div><h3>{title}</h3><p>{copy}</p><button className="text-button">Save idea <Plus size={14} /></button></div>)}</div><div className="plan-summary-grid"><div className="panel plan-summary-card"><div className="eyebrow">Your plan today</div><h3>{riskResult.pcosType} pattern · {planPhase}</h3><p>Small, Indian-food-first choices matched to the signals you have logged. This is supportive education, not a prescription.</p><div className="superfood-list"><strong>Try more today</strong>{superfoods.map((food) => <span key={food}>✅ {food}</span>)}</div><div className="avoid-list"><strong>What to limit today</strong><span>⚠️ sugary drinks, long gaps between meals, and ultra-processed snacks</span></div></div><div className="panel meal-checklist"><div className="eyebrow">Simple meal rhythm</div><div><strong>Breakfast</strong><span>✅ besan chilla + dahi, or oats + nuts</span></div><div><strong>Lunch</strong><span>✅ dal + sabzi + roti, or rajma + chawal</span></div><div><strong>Dinner</strong><span>✅ palak tofu / paneer + millet, or khichdi + vegetables</span></div><small>⚠️ Eat fried foods and sweets in moderation; ❌ avoid skipping meals to compensate.</small></div></div><div className="panel nutrition-plan"><div className="nutrition-plan-heading"><div><div className="eyebrow">A simple weekly rhythm</div><h2>Build your plate, one meal at a time</h2></div><StatusPill tone="gold">PCOS-friendly principles</StatusPill></div><div className="nutrition-plan-grid"><div className="nutrition-day"><strong>Breakfast</strong><span>Greek yogurt + berries + chia</span><span>Eggs + whole-grain toast</span><span>Oats + nuts + cinnamon</span><span>Veg: besan chilla + curd</span><span>Vegan: poha + peanuts</span></div><div className="nutrition-day"><strong>Lunch</strong><span>Colorful grain bowl + tofu</span><span>Lentil soup + side salad</span><span>Chicken / paneer wrap + greens</span><span>Veg: rajma quinoa bowl</span><span>Vegan: chana salad + roti</span></div><div className="nutrition-day"><strong>Snack</strong><span>Apple + nut butter</span><span>Roasted chickpeas</span><span>Fruit + handful of nuts</span></div><div className="nutrition-day"><strong>Dinner</strong><span>Salmon / dal + vegetables</span><span>Stir-fry + brown rice</span><span>Bean tacos + avocado</span><span>Veg: palak tofu + millet</span><span>Vegan: dal + seasonal sabzi</span></div></div><div className="diet-note"><Info size={14} /> Focus on balanced meals with protein, fiber, healthy fats, and regular hydration. Adapt portions and ingredients to your needs with a qualified professional.</div></div><div className="panel phase-movement"><div className="nutrition-plan-heading"><div><div className="eyebrow">Why this?</div><h2>Phase-based movement</h2></div><StatusPill tone="berry">{planPhase}</StatusPill></div><div className="phase-movement-grid"><div><strong>Menstrual · days 1–5</strong><span>10–20 min gentle yoga</span><small>Rest + short walks only if they feel good.</small></div><div><strong>Follicular · days 6–13</strong><span>20–30 min light strength</span><small>Brisk walk or Pilates can feel supportive.</small></div><div><strong>Ovulatory · days 14–16</strong><span>20–30 min dance or cycling</span><small>Peak-energy movement is optional, not required.</small></div><div><strong>Luteal · days 17–28</strong><span>15–25 min yoga or stretching</span><small>Lower-impact movement may feel kinder.</small></div></div></div><div className="panel exercise-plan"><div className="nutrition-plan-heading"><div><div className="eyebrow">Move in a way that feels good</div><h2>Choose your movement mood</h2></div><StatusPill tone="green">No punishment workouts</StatusPill></div><div className="exercise-preferences">{exerciseOptions.map((option) => <button type="button" key={option.id} className={`exercise-choice ${exercisePreference === option.id ? "selected" : ""}`} onClick={() => setExercise(option.id)}><strong>{option.icon} {option.label}</strong><span>{option.copy}</span></button>)}</div><div className="exercise-grid"><div><strong>2× / week</strong><span>20–30 min strength</span><small>Bodyweight squats, wall push-ups, glute bridges</small></div><div><strong>3× / week</strong><span>20–40 min walk</span><small>Steady pace, music on, or a chat with your favorite person</small></div><div><strong>Daily reset</strong><span>5–10 min mobility</span><small>Cat-cow, hip circles, child’s pose, deep breathing</small></div><div><strong>Low-energy days</strong><span>Rest is part of the plan</span><small>Gentle stretching or a short balcony walk is enough</small></div></div><div className="diet-note"><Info size={14} /> Movement should support your energy, not become another source of pressure. Stop if something hurts and ask a professional for personalized advice.</div></div><div className="disclaimer wellness-disclaimer"><Info size={14} /> Wellness suggestions are educational and not a substitute for personalized medical advice.</div>
  </>;
}

function Reports({ name, logs, riskInput, riskResult, forecast }: { name: string; logs: LogEntry[]; riskInput: RiskInput; riskResult: RiskResult; forecast: { average: number; irregular: boolean } }) {
  const moodAverage = logs.length ? (logs.reduce((sum, log) => sum + log.mood, 0) / logs.length).toFixed(1) : "—";
  const topSymptoms = Array.from(new Map(logs.flatMap((log) => log.symptoms).map((symptom) => [symptom, logs.filter((log) => log.symptoms.includes(symptom)).length])).entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const questions = riskResult.pcosType === "Insulin-Resistant" ? ["Should we discuss insulin and glucose testing?", "Which nutrition changes are most useful for my pattern?"] : riskResult.pcosType === "Inflammatory" ? ["Could my acne and cycle changes need additional evaluation?", "Which inflammation-related symptoms should I track?"] : ["What could explain my current cycle pattern?", "Which tests would help clarify my symptoms?"];
  return <>
    <SectionHeader eyebrow="Bring a clearer picture to your appointment" title="Health summary" description="A clean, printable overview of the patterns you've chosen to track." action={<button className="primary-button" onClick={() => window.print()}><Download size={17} /> Share with doctor</button>} />
    <div className="report-preview"><div className="report-head"><div className="brand-inline"><div className="brand-mark small"><span>F</span><span className="brand-mark-dot" /></div><div><div className="brand-name">FemCare <em>AI</em></div><div className="report-subtitle">Personal health summary · generated today</div></div></div><div className="report-badge"><FileText size={15} /> Appointment brief</div></div><div className="report-intro"><h2>{name}</h2><p>This summary is a conversation starter for a healthcare professional, based on self-reported information tracked in the FemCare AI prototype.</p></div><div className="report-grid"><div className="report-stat"><span>PCOS risk rate</span><strong>{riskResult.score}%</strong><small>{riskResult.label} · {riskResult.pcosType}</small></div><div className="report-stat"><span>Latest cycle</span><strong>{logs[0]?.cycleLength || 0} days</strong><small>{logs[0] ? formatDate(logs[0].date) : "No entry"}</small></div><div className="report-stat"><span>Mood average</span><strong>{moodAverage}/10</strong><small>{logs.length} check-ins tracked</small></div></div><div className="report-columns"><div className="report-section"><div className="report-section-heading"><h3>Progress & patterns</h3><span>{logs.length} logged days</span></div><div className="report-factors"><div><span>Cycle regularity trend</span><strong>{forecast.irregular ? "Needs tracking" : "Stable"}</strong></div><div><span>Top symptoms this month</span><strong>{topSymptoms.map(([symptom]) => symptom).join(", ") || "None logged"}</strong></div><div><span>Hormone health indicator</span><strong>{[riskInput.amh, riskInput.lhFsh, riskInput.fastingInsulin, riskInput.testosterone].some((value) => value !== null) ? "Labs entered" : "No labs entered"}</strong></div></div><p className="siya-insight"><strong>Siya’s monthly insight:</strong> {riskResult.pcosType} signals are currently most noticeable alongside a {moodAverage}/10 mood average. Keep logging gently so your clinician can see the pattern over time.</p></div><div className="report-section"><div className="report-section-heading"><h3>Prep for doctor visit</h3><span>Ask about</span></div><div className="doctor-questions">{questions.map((question) => <span key={question}><Check size={13} />{question}</span>)}<span><Check size={13} />Which labs are appropriate for my symptoms and history?</span></div></div></div><div className="report-section"><div className="report-section-heading"><h3>Cycle history</h3><span>Last 6 entries</span></div><div className="report-bars">{logs.slice(0, 6).reverse().map((log, index) => <div className="report-bar" key={log.id}><div className="bar-value">{log.cycleLength}d</div><div className="bar-track"><span style={{ height: `${Math.min(100, log.cycleLength * 2.7)}%` }} /></div><div className="bar-label">C{index + 1}</div></div>)}</div></div><div className="report-footer"><ShieldCheck size={16} /><span>This is a decision-support and awareness tool, not a medical diagnosis. Please consult a healthcare professional.</span></div></div><div className="report-note"><Info size={16} /><div><strong>About this prototype</strong><p>Risk estimates use a reproducible synthetic dataset and lightweight in-browser model logic for demonstration. They are not validated for clinical use.</p></div></div>
  </>;
}
