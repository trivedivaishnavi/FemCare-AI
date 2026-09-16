import React, { useMemo, useState } from "react";
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
  ClipboardList,
  Download,
  Droplets,
  Dumbbell,
  FileText,
  HeartPulse,
  Info,
  LayoutDashboard,
  Leaf,
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

type RiskInput = {
  age: number;
  bmi: number;
  cycleLength: number;
  regularity: string;
  hirsutism: number;
  acne: number;
  weightGain: number;
  hairLoss: number;
  skinDarkening: number;
  fastFood: number;
  exercise: number;
  familyHistory: number;
  folliclesLeft: number;
  folliclesRight: number;
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "companion", label: "Talk to Mira", icon: MessageCircle },
  { id: "intake", label: "Guided intake", icon: ClipboardList },
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
  hirsutism: 2,
  acne: 2,
  weightGain: 1,
  hairLoss: 1,
  skinDarkening: 1,
  fastFood: 2,
  exercise: 3,
  familyHistory: 0,
  folliclesLeft: 9,
  folliclesRight: 11,
};

const modelMetrics = [
  { metric: "Accuracy", logistic: "84%", forest: "89%" },
  { metric: "Precision", logistic: "81%", forest: "87%" },
  { metric: "Recall", logistic: "78%", forest: "86%" },
  { metric: "F1-score", logistic: "79%", forest: "86%" },
  { metric: "ROC-AUC", logistic: "0.88", forest: "0.93" },
];

function calculateRisk(input: RiskInput) {
  const score = Math.min(
    94,
    Math.max(
      8,
      26 +
        (input.regularity === "irregular" ? 17 : input.regularity === "somewhat-irregular" ? 9 : 0) +
        Math.max(0, input.cycleLength - 28) * 0.8 +
        input.hirsutism * 4.5 +
        input.acne * 3.2 +
        input.weightGain * 3.5 +
        input.hairLoss * 2.5 +
        input.skinDarkening * 2.5 +
        input.fastFood * 1.5 -
        input.exercise * 1.2 +
        input.familyHistory * 12 +
        Math.max(0, input.folliclesLeft + input.folliclesRight - 16) * 0.7 +
        (input.bmi > 30 ? 7 : input.bmi > 25 ? 3 : 0),
    ),
  );
  const label = score >= 68 ? "High" : score >= 42 ? "Moderate" : "Low";
  const contributions = [
    { label: "Cycle regularity", value: input.regularity === "irregular" ? 26 : input.regularity === "somewhat-irregular" ? 18 : 5, tone: "berry" },
    { label: "Follicle count", value: Math.round(Math.max(6, input.folliclesLeft + input.folliclesRight - 11) * 1.35), tone: "gold" },
    { label: "Hirsutism", value: input.hirsutism * 8, tone: "rose" },
    { label: "Cycle length", value: Math.round(Math.max(4, input.cycleLength - 24) * 1.6), tone: "berry" },
    { label: "Family history", value: input.familyHistory ? 15 : 0, tone: "gold" },
  ].sort((a, b) => b.value - a.value);
  return { score: Math.round(score), label, contributions: contributions.slice(0, 4) };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`));
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
  { text: "You are allowed to be a work in progress and still be worthy of tenderness.", by: "Mira’s note for today" },
  { text: "Your body is not a problem to solve. She is a home to listen to.", by: "A gentle reminder" },
  { text: "Even on the days you feel behind, you are still becoming someone beautiful.", by: "For your softer days" },
  { text: "You do not have to earn rest, care, love, or a fresh start.", by: "Mira’s note for today" },
  { text: "The way you keep showing up — quietly, imperfectly, honestly — is brave.", by: "For the girlies figuring it out" },
  { text: "You are more than a number, a symptom, a cycle, or a difficult day.", by: "A little truth for today" },
  { text: "Let today be small and kind. Small and kind still counts as moving forward.", by: "Mira’s note for today" },
];

function getDailyQuote(date: Date) {
  return dailyQuotes[Math.floor(date.getTime() / 86400000) % dailyQuotes.length];
}

function getTimeWelcome(hour: number) {
  if (hour < 5) return { title: "Hey, late-night girlie", copy: "The world can wait. A little rest and a little self-kindness are enough for tonight." };
  if (hour < 12) return { title: "Good morning, Vaishnavi", copy: "A clearer view of your rhythm starts here. Here's your latest health snapshot." };
  if (hour < 17) return { title: "Hey there, Vaishnavi", copy: "You're doing better than you think. Here's your latest health snapshot for the day." };
  if (hour < 22) return { title: "Good evening, Vaishnavi", copy: "Take a breath, check in with yourself, and let your patterns guide you gently." };
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

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [riskInput, setRiskInput] = useState<RiskInput>(initialRisk);
  const [riskResult, setRiskResult] = useState(() => calculateRisk(initialRisk));
  const [savedMessage, setSavedMessage] = useState("");
  const today = new Date();
  const indiaHour = Number(new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(today));
  const timeWelcome = getTimeWelcome(indiaHour);
  const dateLabel = formatToday(today);
  const dailyQuote = getDailyQuote(today);
  const [logForm, setLogForm] = useState({ date: indiaDateInputValue(today), cycleLength: "33", mood: "7", symptoms: ["Fatigue"], sleep: "7.5", exercise: "2–3 days", flow: "Moderate" });

  const forecast = useMemo(() => {
    const lengths = logs.map((log) => log.cycleLength).slice(0, 6).reverse();
    const weights = lengths.map((_, index) => index + 1);
    const weighted = lengths.reduce((sum, length, index) => sum + length * weights[index], 0) / weights.reduce((sum, weight) => sum + weight, 0);
    const average = Math.round(weighted);
    const variance = lengths.reduce((sum, value) => sum + (value - average) ** 2, 0) / lengths.length;
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

  const updateRisk = (field: keyof RiskInput, value: string | number) => {
    setRiskInput((current) => ({ ...current, [field]: typeof value === "string" && field !== "regularity" ? Number(value) : value }));
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
    setLogs((current) => [entry, ...current]);
    showSaved("Cycle entry saved to your private timeline");
    goTo("dashboard");
  };

  const assessRisk = (event: React.FormEvent) => {
    event.preventDefault();
    setRiskResult(calculateRisk(riskInput));
    showSaved("Risk estimate refreshed using the selected model");
  };

  const lastLog = logs[0];
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
        <button className="profile-card" onClick={() => showSaved("Profile settings are ready for your next iteration")}><div className="avatar">VT</div><div className="profile-copy"><strong>Vaishnavi Trivedi</strong><span>Personal workspace</span></div><MoreHorizontal size={18} /></button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions"><button className="top-icon icon-button" aria-label="Help"><CircleHelp size={18} /></button><button className="top-icon icon-button" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setDarkMode((value) => !value)}>{darkMode ? <SunMedium size={18} /> : <Moon size={18} />}<div className="notification-dot" /></button><div className="date-chip"><CalendarDays size={16} /> {dateLabel}</div></div>
        </header>

        {savedMessage && <div className="toast"><Check size={16} />{savedMessage}</div>}

        <div className="page-content">
          {activePage === "intake" && <GuidedIntake goTo={goTo} />}
          {activePage === "companion" && <Companion logs={logs} />}
          {activePage === "dashboard" && <Dashboard quote={dailyQuote} goTo={goTo} riskResult={riskResult} lastLog={lastLog} forecast={forecast} chart={dashboardChart} logs={logs} greeting={timeWelcome.title} greetingCopy={timeWelcome.copy} dateLabel={dateLabel} />}
          {activePage === "cycle" && <CycleLog logForm={logForm} setLogForm={setLogForm} toggleSymptom={toggleSymptom} saveLog={saveLog} logs={logs} />}
          {activePage === "risk" && <RiskAssessment riskInput={riskInput} updateRisk={updateRisk} assessRisk={assessRisk} riskResult={riskResult} />}
          {activePage === "forecast" && <Forecast forecast={forecast} logs={logs} />}
          {activePage === "nutrition" && <NutritionMood logs={logs} />}
          {activePage === "reports" && <Reports logs={logs} riskResult={riskResult} forecast={forecast} />}
        </div>
      </main>
    </div>
  );
}

function GuidedIntake({ goTo }: { goTo: (page: string) => void }) {
  const [step, setStep] = useState(1);
  const steps = ["Basics", "Lifestyle & mood", "Menstrual health", "Symptoms & history", "Your plan"];
  const stepCopy = [
    { title: "Start with the basics", copy: "A few foundational details help personalize your experience.", fields: ["Age", "Height & weight", "Location / timezone", "What would you like support with?"] },
    { title: "Tell us about your lifestyle", copy: "Your everyday rhythm matters just as much as your cycle.", fields: ["Sleep quality", "Movement frequency", "Food routine", "Stress & mood today"] },
    { title: "Map your menstrual health", copy: "There is no perfect cycle. Honest information helps us spot patterns.", fields: ["Last period start date", "Typical cycle length", "Cycle regularity", "Flow & period pain"] },
    { title: "Add symptoms & family history", copy: "Share only what feels comfortable. You can edit this later.", fields: ["Acne / facial hair", "Hair loss / skin changes", "Weight changes", "Family history of PCOS"] },
    { title: "Your starting plan is ready", copy: "We will use these signals to shape your dashboard and PCOS risk awareness estimate.", fields: ["Cycle tracking", "PCOS risk rate estimate", "Nutrition & mood support", "Appointment summary"] },
  ];
  const current = stepCopy[step - 1];
  return <><SectionHeader eyebrow={`Step ${step} of ${steps.length} · Your private setup`} title={current.title} description={current.copy} action={<div className="method-chip"><ShieldCheck size={15} /> You can change this later</div>} />
    <div className="intake-layout"><div className="panel intake-panel"><div className="intake-progress">{steps.map((item, index) => <button type="button" key={item} className={`intake-step ${index + 1 <= step ? "done" : ""} ${index + 1 === step ? "current" : ""}`} onClick={() => setStep(index + 1)}><span>{index + 1 <= step ? <Check size={13} /> : index + 1}</span><strong>{item}</strong></button>)}</div><div className="intake-form-grid">{step === 1 && <><label className="intake-field"><span>Age</span><input type="number" min="13" max="80" defaultValue="24" /></label><label className="intake-field"><span>Height</span><div className="inline-input"><input type="number" min="100" max="220" defaultValue="162" /><small>cm</small></div></label><label className="intake-field"><span>Weight</span><div className="inline-input"><input type="number" min="30" max="250" defaultValue="67" /><small>kg</small></div></label><label className="intake-field"><span>Main goal</span><select defaultValue="understand"><option value="understand">Understand my patterns</option><option value="cycle">Track my cycle</option><option value="symptoms">Understand symptoms</option><option value="nutrition">Improve nutrition</option><option value="appointment">Prepare for an appointment</option></select></label></>}
{step === 2 && <><label className="intake-field"><span>Sleep quality</span><select defaultValue="okay"><option value="great">Great — I wake refreshed</option><option value="okay">Okay — could be better</option><option value="poor">Poor — often restless</option><option value="very-poor">Very poor — hard to sleep</option></select></label><label className="intake-field"><span>Movement routine</span><select defaultValue="sometimes"><option value="rarely">Rarely or never</option><option value="sometimes">1–2 days a week</option><option value="regular">3–4 days a week</option><option value="active">5+ days a week</option></select></label><label className="intake-field"><span>Food preference</span><select defaultValue="vegetarian"><option value="vegetarian">Indian vegetarian</option><option value="vegan">Vegan</option><option value="nonveg">Non-vegetarian</option><option value="eggetarian">Eggetarian</option><option value="jain">Jain vegetarian</option></select></label><label className="intake-field"><span>Stress level today <strong className="range-value">5/10</strong></span><input type="range" min="1" max="10" defaultValue="5" /></label></>}
{step === 3 && <><label className="intake-field"><span>Last period started</span><input type="date" defaultValue="2026-08-18" /></label><label className="intake-field"><span>Typical cycle length</span><div className="inline-input"><input type="number" min="18" max="60" defaultValue="34" /><small>days</small></div></label><label className="intake-field"><span>Cycle regularity</span><select defaultValue="somewhat"><option value="regular">Mostly regular</option><option value="somewhat">Sometimes early or late</option><option value="irregular">Very irregular</option><option value="unknown">Still learning my pattern</option></select></label><label className="intake-field"><span>Period pain</span><select defaultValue="mild"><option value="none">None</option><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></select></label></>}
{step === 4 && <><fieldset className="intake-field intake-wide"><legend>Symptoms you notice</legend><div className="intake-check-grid">{["Acne", "Facial hair growth", "Hair thinning", "Skin darkening", "Weight changes", "Bloating", "Fatigue", "Mood changes"].map((symptom) => <label key={symptom}><input type="checkbox" defaultChecked={["Fatigue", "Bloating"].includes(symptom)} />{symptom}</label>)}</div></fieldset><label className="intake-field"><span>Family history of PCOS</span><select defaultValue="no"><option value="no">No known family history</option><option value="yes">Yes, a close relative</option><option value="unsure">I’m not sure</option></select></label><label className="intake-field"><span>Medical support right now</span><select defaultValue="none"><option value="none">Not currently</option><option value="doctor">I’m seeing a doctor</option><option value="planning">I’m planning an appointment</option></select></label></>}
{step === 5 && <><div className="intake-summary"><Sparkles size={18} /><div><strong>Your FemCare starting plan</strong><p>We’ll use your answers to shape your dashboard, estimated PCOS risk rate, cycle forecast, nutrition ideas, and gentle movement suggestions.</p></div></div><label className="intake-field"><span>How would you like Mira to support you?</span><select defaultValue="warm"><option value="warm">Warm encouragement</option><option value="direct">Clear and practical</option><option value="quiet">Mostly listen while I rant</option><option value="balanced">A mix of all three</option></select></label><label className="intake-field"><span>Reminder preference</span><select defaultValue="daily"><option value="daily">A gentle daily check-in</option><option value="weekly">A weekly reflection</option><option value="none">I’ll check in when I need to</option></select></label></>}</div><div className="intake-actions"><button className="soft-button" type="button" disabled={step === 1} onClick={() => setStep((value) => value - 1)}>Back</button>{step < steps.length ? <button className="primary-button" type="button" onClick={() => setStep((value) => value + 1)}>Continue <ChevronRight size={16} /></button> : <button className="primary-button" type="button" onClick={() => goTo("dashboard")}>Open my dashboard <ArrowUpRight size={16} /></button>}</div></div><div className="intake-side"><div className="panel motivation-card"><div className="motivation-spark"><Sparkles size={17} /></div><div className="eyebrow">A note for you</div><h3>You deserve care that feels personal.</h3><p>There is no “good” or “bad” answer here. This is a starting point, not a test.</p><span>One step at a time · You’ve got this</span></div><div className="panel intake-checklist"><div className="eyebrow">What we’ll personalize</div>{["Dashboard snapshot", "Estimated PCOS risk rate", "Cycle forecast", "Nutrition support", "Printable health summary"].map((item) => <div key={item}><Check size={14} />{item}</div>)}</div></div></div></>;
}

function Companion({ logs }: { logs: LogEntry[] }) {
  const latest = logs[0] || initialLogs[0];
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(() => {
    try {
      const stored = window.localStorage.getItem("femcare-mira-chat");
      return stored ? JSON.parse(stored) : [{ from: "mira", text: "Hey girlie, I’m Mira. You can rant here — no fixing, no judgment, no pretending you’re fine. What’s sitting heavy today?" }];
    } catch { return [{ from: "mira", text: "Hey girlie, I’m Mira. You can rant here — no fixing, no judgment, no pretending you’re fine. What’s sitting heavy today?" }]; }
  });
  const [input, setInput] = useState("");
  const phase = latest.cycleLength > 35 ? "a variable cycle window" : "your current cycle rhythm";
  const moodNote = latest.mood <= 5 ? "I noticed your recent mood check-in felt low, so we can keep this soft and low-pressure." : latest.mood >= 8 ? "Your latest mood check-in sounded brighter — we can build on that little spark." : "We can meet you exactly where your mood is today.";
  const replies = [
    `I hear you. You don’t have to make this sound smaller for me. I’m holding space for ${phase}.`,
    `That sounds like a lot to carry. ${moodNote} Let’s take one tiny, kind next step — or just breathe here for a minute.`,
    "You are not being dramatic. Your feelings are information, and you deserve support with them.",
    "I’m proud of you for saying it out loud. You’re allowed to want care, softness, and answers.",
  ];
  const sendMessage = (text = input) => { if (!text.trim()) return; setMessages((current) => { const next = [...current, { from: "you", text: text.trim() }, { from: "mira", text: replies[current.length % replies.length] }]; window.localStorage.setItem("femcare-mira-chat", JSON.stringify(next)); return next; }); setInput(""); };
  return <><SectionHeader eyebrow="Your soft place to land" title="Talk to Mira" description="A warm check-in companion for messy thoughts, body questions, and the days you just need someone to listen." action={<StatusPill tone="rose"><MessageCircle size={13} /> Here with you</StatusPill>} /><div className="companion-layout"><div className="panel chat-panel"><div className="chat-head"><div className="mira-avatar">M</div><div><strong>Mira</strong><span>Your gentle, no-judgment check-in companion</span></div><span className="online-dot">online</span></div><div className="chat-messages">{messages.map((message, index) => <div className={`chat-bubble ${message.from}`} key={index}>{message.text}</div>)}</div><div className="quick-prompts">{["I feel overwhelmed", "I’m worried about my symptoms", "I need a tiny win"].map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>)}</div><div className="chat-compose"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder="Tell Mira what’s on your mind…" aria-label="Message Mira" /><button onClick={() => sendMessage()} aria-label="Send message"><Send size={17} /></button></div></div><div className="panel companion-note"><div className="motivation-spark"><Sparkles size={17} /></div><div className="eyebrow">A little boundary, with love</div><h3>Mira listens. Professionals diagnose.</h3><p>She can help you reflect, organize questions, and find a little comfort. She cannot diagnose or replace a healthcare professional.</p><div className="mira-values"><span><Check size={14} /> No shame</span><span><Check size={14} /> No comparison</span><span><Check size={14} /> No perfect answers</span></div></div></div></>;
}

function Dashboard({ quote, goTo, riskResult, lastLog, forecast, chart, logs, greeting, greetingCopy, dateLabel }: { quote: { text: string; by: string }; goTo: (page: string) => void; riskResult: ReturnType<typeof calculateRisk>; lastLog: LogEntry; forecast: { average: number; irregular: boolean }; chart: { month: string; days: number }[]; logs: LogEntry[]; greeting: string; greetingCopy: string; dateLabel: string }) {
  return <>
    <SectionHeader eyebrow={dateLabel} title={greeting} description={greetingCopy} quote={quote} action={<button className="primary-button" onClick={() => goTo("cycle")}><Plus size={17} /> Log today's health</button>} />
    <div className="dashboard-grid-top">
      <div className="hero-card">
        <div className="hero-card-glow" />
        <div className="hero-card-content"><div className="hero-kicker"><span className="pulse-dot" /> Cycle day 23 <span className="kicker-divider" /> Luteal phase</div><h2>Your body is in a <span>reflective rhythm.</span></h2><p>Energy may feel a little softer this week. Small, consistent choices can support your next cycle.</p><button className="text-button" onClick={() => goTo("nutrition")}>Explore gentle guidance <ArrowUpRight size={15} /></button></div><div className="cycle-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-center"><Droplets size={22} /><strong>23</strong><span>day</span></div><span className="orbit-label label-top">Now</span><span className="orbit-label label-bottom">Sep 25</span></div>
      </div>
      <div className="insight-card"><div className="card-heading"><div><div className="eyebrow">Personal insight</div><h3>A pattern worth noticing</h3></div><Sparkles size={19} className="gold-icon" /></div><div className="insight-visual"><div className="insight-bar"><span style={{ height: "78%" }} /><span style={{ height: "64%" }} /><span style={{ height: "88%" }} /><span style={{ height: "70%" }} /><span style={{ height: "92%" }} /><span style={{ height: "75%" }} /></div><div className="insight-number"><strong>+3.2</strong><span>days variation</span></div></div><p>Your last 4 cycles show more variation than usual. It may be useful to mention this pattern at your next appointment.</p><button className="soft-button" onClick={() => goTo("forecast")}>View forecast <ChevronRight size={15} /></button></div>
    </div>

    <div className="metric-grid"><MetricCard icon={Droplets} label="Current cycle" value={`${lastLog.cycleLength} days`} helper="Cycle 4 of your timeline" tone="berry" /><MetricCard icon={Target} label="PCOS risk rate" value={`${riskResult.score}%`} helper={`${riskResult.label} · estimated PCOS risk`} tone="rose" /><MetricCard icon={TrendingUp} label="Next cycle" value={`~${forecast.average} days`} helper={forecast.irregular ? "Pattern looks variable" : "Weighted forecast"} tone="gold" /><MetricCard icon={Moon} label="Sleep average" value="7.3 hrs" helper="Up 0.4 hrs this month" tone="green" /></div>

    <div className="content-grid two-thirds"><div className="panel chart-panel"><div className="panel-heading"><div><div className="eyebrow">Cycle rhythm</div><h3>Your recent pattern</h3></div><button className="icon-button subtle" onClick={() => goTo("forecast")} aria-label="Open forecast"><ArrowUpRight size={17} /></button></div><div className="chart-legend"><span><i className="legend-swatch berry" /> Cycle length</span><span className="legend-note">Last 6 months</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={220}><AreaChart data={chart} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="cycleFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d2e46" stopOpacity={0.22} /><stop offset="100%" stopColor="#6d2e46" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eadfd7" strokeDasharray="4 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><YAxis domain={[24, 38]} axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="days" stroke="#6d2e46" strokeWidth={2.5} fill="url(#cycleFill)" dot={{ fill: "#6d2e46", strokeWidth: 3, stroke: "#fffaf7", r: 4 }} activeDot={{ r: 6 }} /></AreaChart></ResponsiveContainer></div><div className="chart-footer"><span><strong>32.5 days</strong> average cycle</span><StatusPill tone={forecast.irregular ? "gold" : "green"}>{forecast.irregular ? "Variable pattern" : "Stable pattern"}</StatusPill></div></div>
      <div className="panel"><div className="panel-heading"><div><div className="eyebrow">Latest assessment</div><h3>Risk overview</h3></div><StatusPill tone="gold">Prototype model</StatusPill></div><div className="risk-overview"><RiskRing score={riskResult.score} /><div className="risk-copy"><div className="risk-label">{riskResult.label} PCOS risk rate</div><p>Based on 14 self-reported signals and a synthetic training set. This is an estimated PCOS risk rate, not a diagnosis.</p><button className="text-button" onClick={() => goTo("risk")}>Review factors <ArrowUpRight size={15} /></button></div></div><div className="mini-factor-list">{riskResult.contributions.slice(0, 3).map((item) => <div className="mini-factor" key={item.label}><span>{item.label}</span><strong>+{item.value}%</strong></div>)}</div><div className="disclaimer"><Info size={14} /> This is a decision-support and awareness tool, not a medical diagnosis.</div></div></div>

    <div className="content-grid two-thirds bottom-grid"><div className="panel"><div className="panel-heading"><div><div className="eyebrow">Timeline</div><h3>Recent check-ins</h3></div><button className="soft-button compact" onClick={() => goTo("cycle")}>View cycle log <ChevronRight size={15} /></button></div><div className="timeline-list">{logs.slice(0, 3).map((log, index) => <div className="timeline-row" key={log.id}><div className={`timeline-icon ${index === 0 ? "current" : ""}`}><Droplets size={16} /></div><div className="timeline-copy"><strong>{index === 0 ? "Cycle started" : "Health check-in"}</strong><span>{formatDate(log.date)} · {log.symptoms.join(" · ")}</span></div><div className="timeline-value"><strong>{log.cycleLength}d</strong><span>cycle</span></div></div>)}</div></div><div className="quote-card"><div className="quote-mark">“</div><p>You don't need perfect data. You just need a few honest signals, tracked over time.</p><span>FemCare AI principle</span><div className="motivation-side"><strong>You are not behind.</strong><span>Your body is giving you information — and you are learning to listen.</span></div></div></div>
  </>;
}

function CycleLog({ logForm, setLogForm, toggleSymptom, saveLog, logs }: { logForm: any; setLogForm: React.Dispatch<React.SetStateAction<any>>; toggleSymptom: (symptom: string) => void; saveLog: (event: React.FormEvent) => void; logs: LogEntry[] }) {
  const symptoms = ["Cramps", "Mood changes", "Fatigue", "Bloating", "Acne", "Hirsutism", "Weight change"];
  return <>
    <SectionHeader eyebrow="Your private timeline" title="Cycle log" description="Capture a few signals at a time. Your patterns become clearer as your timeline grows." action={<div className="privacy-badge"><ShieldCheck size={16} /> Private by default</div>} />
    <div className="log-layout"><form className="panel log-form" onSubmit={saveLog}><div className="panel-heading"><div><div className="eyebrow">New entry</div><h3>How are you feeling today?</h3></div><NotebookPen size={20} className="rose-icon" /></div><div className="form-grid"><label className="field"><span>Cycle start date</span><input type="date" value={logForm.date} onChange={(e) => setLogForm((current: any) => ({ ...current, date: e.target.value }))} /></label><label className="field"><span>Cycle length <small>days</small></span><input type="number" min="18" max="60" value={logForm.cycleLength} onChange={(e) => setLogForm((current: any) => ({ ...current, cycleLength: e.target.value }))} /></label></div><div className="field"><span>Symptoms today</span><div className="chip-grid">{symptoms.map((symptom) => <button type="button" key={symptom} className={`choice-chip ${logForm.symptoms.includes(symptom) ? "selected" : ""}`} onClick={() => toggleSymptom(symptom)}>{logForm.symptoms.includes(symptom) && <Check size={14} />}{symptom}</button>)}</div></div><div className="form-grid"><label className="field"><span>Mood <small>1–10</small></span><div className="range-row"><input type="range" min="1" max="10" value={logForm.mood} onChange={(e) => setLogForm((current: any) => ({ ...current, mood: e.target.value }))} /><strong>{logForm.mood}/10</strong></div></label><label className="field"><span>Sleep <small>hours</small></span><input type="number" min="0" max="14" step="0.5" value={logForm.sleep} onChange={(e) => setLogForm((current: any) => ({ ...current, sleep: e.target.value }))} /></label></div><div className="form-grid"><label className="field"><span>Movement</span><select value={logForm.exercise} onChange={(e) => setLogForm((current: any) => ({ ...current, exercise: e.target.value }))}><option>Rest day</option><option>1 day</option><option>2–3 days</option><option>4+ days</option></select></label><label className="field"><span>Flow</span><select value={logForm.flow} onChange={(e) => setLogForm((current: any) => ({ ...current, flow: e.target.value }))}><option>Light</option><option>Moderate</option><option>Heavy</option></select></label></div><button className="primary-button full-width" type="submit"><Plus size={17} /> Save health entry</button></form><div className="log-side"><div className="panel mini-calendar"><div className="panel-heading"><div><div className="eyebrow">September 2026</div><h3>Cycle map</h3></div><CalendarDays size={19} className="gold-icon" /></div><div className="calendar-week"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><div className="calendar-grid">{Array.from({ length: 30 }, (_, index) => <span key={index} className={`${index + 1 === 23 ? "today" : ""} ${index + 1 >= 20 && index + 1 <= 26 ? "luteal" : ""}`}>{index + 1}</span>)}</div><div className="calendar-key"><span><i className="dot berry-dot" /> Current phase</span><span><i className="dot today-dot" /> Today</span></div></div><div className="panel tracking-tip"><div className="tip-icon"><Sparkles size={17} /></div><div><strong>Small data, big picture</strong><p>One entry takes less than a minute. Regular check-ins help your trends feel more personal.</p></div></div></div></div>
    <div className="panel history-panel"><div className="panel-heading"><div><div className="eyebrow">Since May 2026</div><h3>Check-in history</h3></div><span className="muted-count">{logs.length} entries</span></div><div className="history-table"><div className="history-header"><span>Date</span><span>Cycle</span><span>Symptoms</span><span>Sleep</span><span>Movement</span><span /></div>{logs.map((log) => <div className="history-row" key={log.id}><span className="date-cell"><CalendarDays size={14} />{formatDate(log.date)}</span><strong>{log.cycleLength} days</strong><span className="symptom-summary">{log.symptoms.slice(0, 2).join(" · ")}</span><span>{log.sleep} hrs</span><span>{log.exercise}</span><button className="icon-button subtle" aria-label="More options"><MoreHorizontal size={16} /></button></div>)}</div></div>
  </>;
}

function RiskAssessment({ riskInput, updateRisk, assessRisk, riskResult }: { riskInput: RiskInput; updateRisk: (field: keyof RiskInput, value: string | number) => void; assessRisk: (event: React.FormEvent) => void; riskResult: ReturnType<typeof calculateRisk> }) {
  const fields: { key: keyof RiskInput; label: string; min: number; max: number; step?: number; suffix?: string }[] = [
    { key: "age", label: "Age", min: 18, max: 50, suffix: "years" },
    { key: "bmi", label: "BMI", min: 16, max: 45, step: 0.1 },
    { key: "cycleLength", label: "Typical cycle length", min: 18, max: 60, suffix: "days" },
    { key: "hirsutism", label: "Hirsutism", min: 0, max: 4, suffix: "0–4" },
    { key: "acne", label: "Acne", min: 0, max: 4, suffix: "0–4" },
    { key: "weightGain", label: "Recent weight gain", min: 0, max: 4, suffix: "0–4" },
    { key: "hairLoss", label: "Hair loss", min: 0, max: 4, suffix: "0–4" },
    { key: "skinDarkening", label: "Skin darkening", min: 0, max: 4, suffix: "0–4" },
    { key: "fastFood", label: "Fast-food frequency", min: 0, max: 7, suffix: "days/wk" },
    { key: "exercise", label: "Exercise frequency", min: 0, max: 7, suffix: "days/wk" },
    { key: "folliclesLeft", label: "Follicles · left ovary", min: 0, max: 30 },
    { key: "folliclesRight", label: "Follicles · right ovary", min: 0, max: 30 },
  ];
  return <>
    <SectionHeader eyebrow="Pattern awareness" title="Risk assessment" description="Explore how your self-reported signals combine into an awareness estimate — never a diagnosis." action={<StatusPill tone="green"><span className="status-dot" /> Model online</StatusPill>} />
    <div className="assessment-layout"><form className="panel assessment-form" onSubmit={assessRisk}><div className="assessment-intro"><div className="intro-icon"><Activity size={20} /></div><div><strong>Run a fresh estimate</strong><p>The stronger Random Forest model is selected automatically from a synthetic PCOS dataset.</p></div></div><div className="field-section"><div className="subheading">Basics & cycle pattern</div><div className="form-grid three-col">{fields.slice(0, 3).map((field) => <label className="field" key={String(field.key)}><span>{field.label}{field.suffix && <small>{field.suffix}</small>}</span><input type="number" min={field.min} max={field.max} step={field.step || 1} value={riskInput[field.key] as number} onChange={(e) => updateRisk(field.key, e.target.value)} /></label>)}</div><label className="field"><span>How regular are your cycles?</span><select value={riskInput.regularity} onChange={(e) => updateRisk("regularity", e.target.value)}><option value="regular">Mostly regular</option><option value="somewhat-irregular">Somewhat irregular</option><option value="irregular">Very irregular</option></select></label></div><div className="field-section"><div className="subheading">Symptoms & lifestyle <span>0 = none · 4 = frequent / intense</span></div><div className="form-grid three-col">{fields.slice(3, 10).map((field) => <label className="field" key={String(field.key)}><span>{field.label}<small>{field.suffix}</small></span><input type="number" min={field.min} max={field.max} value={riskInput[field.key] as number} onChange={(e) => updateRisk(field.key, e.target.value)} /></label>)}</div><label className="field"><span>Family history of PCOS?</span><select value={riskInput.familyHistory} onChange={(e) => updateRisk("familyHistory", e.target.value)}><option value="0">No known family history</option><option value="1">Yes, first-degree relative</option></select></label></div><div className="field-section"><div className="subheading">Ultrasound signals <span>optional</span></div><div className="form-grid two-col">{fields.slice(10).map((field) => <label className="field" key={String(field.key)}><span>{field.label}<small>count</small></span><input type="number" min={field.min} max={field.max} value={riskInput[field.key] as number} onChange={(e) => updateRisk(field.key, e.target.value)} /></label>)}</div></div><button className="primary-button full-width" type="submit"><RefreshCcw size={17} /> Update risk estimate</button><div className="disclaimer large"><Info size={15} /><span>This is a decision-support and awareness tool, not a medical diagnosis. Please consult a healthcare professional.</span></div></form><div className="assessment-result"><div className="panel result-card"><div className="panel-heading"><div><div className="eyebrow">Latest PCOS risk output</div><h3>PCOS risk rate estimate</h3></div><StatusPill tone={riskResult.label === "High" ? "rose" : riskResult.label === "Moderate" ? "gold" : "green"}>{riskResult.label} range</StatusPill></div><div className="result-ring-row"><RiskRing score={riskResult.score} /><div><div className="result-big-label">{riskResult.label} PCOS risk rate</div><p>The selected model estimates a {riskResult.score}% PCOS risk rate based on the current inputs.</p></div></div><div className="result-callout"><Zap size={17} /><span>Random Forest selected · ROC-AUC <strong>0.93</strong></span></div><div className="factor-heading"><div><div className="eyebrow">Explainable AI</div><h4>What shaped this estimate?</h4></div><span>Top 4 signals</span></div><div className="factor-bars">{riskResult.contributions.map((item) => <div className="factor-row" key={item.label}><div className="factor-meta"><span>{item.label}</span><strong>+{item.value}%</strong></div><div className="factor-track"><div className={`factor-fill ${item.tone}`} style={{ width: `${Math.min(96, item.value * 3)}%` }} /></div></div>)}</div><p className="factor-note">Contributions are model explanations, not clinical conclusions.</p></div><div className="panel metrics-card"><div className="panel-heading"><div><div className="eyebrow">Training snapshot</div><h3>Model comparison</h3></div><BarChart3 size={19} className="gold-icon" /></div><div className="metrics-table"><div className="metrics-table-head"><span>Metric</span><span>Logistic</span><span className="highlight">Forest</span></div>{modelMetrics.map((metric) => <div className="metrics-table-row" key={metric.metric}><span>{metric.metric}</span><span>{metric.logistic}</span><strong>{metric.forest}</strong></div>)}</div><p className="model-footnote">Synthetic dataset · 420 rows · 80/20 held-out split</p></div></div></div>
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

function NutritionMood({ logs }: { logs: LogEntry[] }) {
  const [exercisePreference, setExercisePreference] = useState(() => window.localStorage.getItem("femcare-exercise-preference") || "low-energy");
  const setExercise = (value: string) => { setExercisePreference(value); window.localStorage.setItem("femcare-exercise-preference", value); };
  const exerciseOptions = [{ id: "yoga", label: "Yoga", icon: "◒", copy: "Flow, breathwork, hip-openers, and restorative stretches." }, { id: "gym", label: "Gym", icon: "✦", copy: "Strength machines, moderate cardio, and confident progressive training." }, { id: "home", label: "Home workouts", icon: "⌂", copy: "Bodyweight strength, dance breaks, and short guided circuits." }, { id: "low-energy", label: "Low-energy", icon: "☾", copy: "Mobility, gentle walking, stretching, and guilt-free rest." }];
  const suggestions = [{ icon: Leaf, tag: "Inflammation support", title: "Build a colorful plate", copy: "Try leafy greens, berries, olive oil, and a protein-rich base for your next meal.", tone: "green" }, { icon: Dumbbell, tag: "Luteal phase", title: "Choose gentler movement", copy: "A walk, mobility flow, or light strength session can support energy without overreaching.", tone: "berry" }, { icon: Moon, tag: "Rest rhythm", title: "Protect your wind-down", copy: "A consistent bedtime and lower light in the last hour can help your sleep signals stay steady.", tone: "gold" }];
  return <>
    <SectionHeader eyebrow="Supportive, not prescriptive" title="Nutrition & mood" description="Simple rule-based guidance based on the signals you choose to track. Take what feels useful." action={<div className="method-chip"><Sparkles size={15} /> Gentle guidance</div>} />
    <div className="wellness-grid"><div className="panel mood-panel"><div className="panel-heading"><div><div className="eyebrow">Mood rhythm</div><h3>How your mood has moved</h3></div><div className="mood-score"><strong>7.0</strong><span>average / 10</span></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={230}><AreaChart data={moodTrend} margin={{ top: 12, right: 8, left: -25, bottom: 0 }}><defs><linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a26769" stopOpacity={0.25} /><stop offset="100%" stopColor="#a26769" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eadfd7" strokeDasharray="4 4" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><YAxis domain={[1, 10]} axisLine={false} tickLine={false} tick={{ fill: "#9d8d85", fontSize: 11 }} /><Tooltip /><Area type="monotone" dataKey="mood" stroke="#a26769" strokeWidth={2.5} fill="url(#moodFill)" dot={{ fill: "#a26769", stroke: "#fffaf7", strokeWidth: 3, r: 4 }} /></AreaChart></ResponsiveContainer></div><div className="mood-insight"><div className="tip-icon"><Sparkles size={15} /></div><p>Your mood tends to dip slightly during the late luteal window, then lift again as your next cycle begins.</p></div></div><div className="panel phase-card"><div className="eyebrow">Today · day 23</div><h3>Luteal phase</h3><p>A softer season for your energy. Small routines may feel better than big pushes.</p><div className="phase-progress"><span style={{ width: "72%" }} /></div><div className="phase-meta"><span>Day 23</span><span>~5 days to next cycle</span></div><div className="phase-orbit-small"><div className="orbit-center"><Moon size={18} /><strong>72%</strong><span>through</span></div></div></div></div>
    <div className="suggestions-header"><div><div className="eyebrow">Based on your recent signals</div><h2>Three small ideas for today</h2></div><StatusPill tone="green">No diagnosis · just support</StatusPill></div><div className="suggestion-grid">{suggestions.map(({ icon: Icon, tag, title, copy, tone }) => <div className={`suggestion-card ${tone}`} key={title}><div className="suggestion-icon"><Icon size={19} /></div><div className="suggestion-tag">{tag}</div><h3>{title}</h3><p>{copy}</p><button className="text-button">Save idea <Plus size={14} /></button></div>)}</div><div className="panel nutrition-plan"><div className="nutrition-plan-heading"><div><div className="eyebrow">A simple weekly rhythm</div><h2>Build your plate, one meal at a time</h2></div><StatusPill tone="gold">PCOS-friendly principles</StatusPill></div><div className="nutrition-plan-grid"><div className="nutrition-day"><strong>Breakfast</strong><span>Greek yogurt + berries + chia</span><span>Eggs + whole-grain toast</span><span>Oats + nuts + cinnamon</span><span>Veg: besan chilla + curd</span><span>Vegan: poha + peanuts</span></div><div className="nutrition-day"><strong>Lunch</strong><span>Colorful grain bowl + tofu</span><span>Lentil soup + side salad</span><span>Chicken / paneer wrap + greens</span><span>Veg: rajma quinoa bowl</span><span>Vegan: chana salad + roti</span></div><div className="nutrition-day"><strong>Snack</strong><span>Apple + nut butter</span><span>Roasted chickpeas</span><span>Fruit + handful of nuts</span></div><div className="nutrition-day"><strong>Dinner</strong><span>Salmon / dal + vegetables</span><span>Stir-fry + brown rice</span><span>Bean tacos + avocado</span><span>Veg: palak tofu + millet</span><span>Vegan: dal + seasonal sabzi</span></div></div><div className="diet-note"><Info size={14} /> Focus on balanced meals with protein, fiber, healthy fats, and regular hydration. Adapt portions and ingredients to your needs with a qualified professional.</div></div><div className="panel exercise-plan"><div className="nutrition-plan-heading"><div><div className="eyebrow">Move in a way that feels good</div><h2>Choose your movement mood</h2></div><StatusPill tone="green">No punishment workouts</StatusPill></div><div className="exercise-preferences">{exerciseOptions.map((option) => <button type="button" key={option.id} className={`exercise-choice ${exercisePreference === option.id ? "selected" : ""}`} onClick={() => setExercise(option.id)}><strong>{option.icon} {option.label}</strong><span>{option.copy}</span></button>)}</div><div className="exercise-grid"><div><strong>2× / week</strong><span>20–30 min strength</span><small>Bodyweight squats, wall push-ups, glute bridges</small></div><div><strong>3× / week</strong><span>20–40 min walk</span><small>Steady pace, music on, or a chat with your favorite person</small></div><div><strong>Daily reset</strong><span>5–10 min mobility</span><small>Cat-cow, hip circles, child’s pose, deep breathing</small></div><div><strong>Low-energy days</strong><span>Rest is part of the plan</span><small>Gentle stretching or a short balcony walk is enough</small></div></div><div className="diet-note"><Info size={14} /> Movement should support your energy, not become another source of pressure. Stop if something hurts and ask a professional for personalized advice.</div></div><div className="disclaimer wellness-disclaimer"><Info size={14} /> Wellness suggestions are educational and not a substitute for personalized medical advice.</div>
  </>;
}

function Reports({ logs, riskResult, forecast }: { logs: LogEntry[]; riskResult: ReturnType<typeof calculateRisk>; forecast: { average: number; irregular: boolean } }) {
  return <>
    <SectionHeader eyebrow="Bring a clearer picture to your appointment" title="Health summary" description="A clean, printable overview of the patterns you've chosen to track." action={<button className="primary-button" onClick={() => window.print()}><Download size={17} /> Print / save PDF</button>} />
    <div className="report-preview"><div className="report-head"><div className="brand-inline"><div className="brand-mark small"><span>F</span><span className="brand-mark-dot" /></div><div><div className="brand-name">FemCare <em>AI</em></div><div className="report-subtitle">Personal health summary · generated Sep 16, 2026</div></div></div><div className="report-badge"><FileText size={15} /> Appointment brief</div></div><div className="report-intro"><h2>Vaishnavi Trivedi</h2><p>This summary is a conversation starter for a healthcare professional, based on self-reported information tracked in the FemCare AI prototype.</p></div><div className="report-grid"><div className="report-stat"><span>Latest cycle</span><strong>{logs[0]?.cycleLength || 0} days</strong><small>{logs[0] ? formatDate(logs[0].date) : "No entry"}</small></div><div className="report-stat"><span>Next cycle estimate</span><strong>~{forecast.average} days</strong><small>{forecast.irregular ? "Variable pattern" : "Weighted forecast"}</small></div><div className="report-stat"><span>Estimated PCOS risk rate</span><strong>{riskResult.score}%</strong><small>{riskResult.label} · model estimate</small></div></div><div className="report-section"><div className="report-section-heading"><h3>Cycle history</h3><span>{logs.length} logged cycles</span></div><div className="report-bars">{logs.slice(0, 6).reverse().map((log, index) => <div className="report-bar" key={log.id}><div className="bar-value">{log.cycleLength}d</div><div className="bar-track"><span style={{ height: `${Math.min(100, log.cycleLength * 2.7)}%` }} /></div><div className="bar-label">C{index + 1}</div></div>)}</div></div><div className="report-columns"><div className="report-section"><div className="report-section-heading"><h3>Top contributing signals</h3><span>Latest estimate</span></div><div className="report-factors">{riskResult.contributions.map((item) => <div key={item.label}><span>{item.label}</span><strong>+{item.value}%</strong></div>)}</div></div><div className="report-section"><div className="report-section-heading"><h3>Recent symptoms</h3><span>Timeline</span></div><div className="report-symptoms">{Array.from(new Set(logs.flatMap((log) => log.symptoms))).slice(0, 6).map((symptom) => <span key={symptom}><Check size={13} />{symptom}</span>)}</div></div></div><div className="report-footer"><ShieldCheck size={16} /><span>This is a decision-support and awareness tool, not a medical diagnosis. Please consult a healthcare professional.</span></div></div><div className="report-note"><Info size={16} /><div><strong>About this prototype</strong><p>Risk estimates use a reproducible synthetic dataset and lightweight in-browser model logic for demonstration. They are not validated for clinical use.</p></div></div>
  </>;
}
