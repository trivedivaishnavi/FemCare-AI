import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Check, Heart, Leaf, LockKeyhole, Mail, Sparkles, Stars, UserRound } from "lucide-react";
import { createLocalAccount, getLocalAccount, getAccountByEmail, setSession, verifyLocalAccount } from "@/lib/auth";
import type { LocalAccount } from "@/lib/auth";

type LoginProps = { onLogin: (account: LocalAccount) => void };
const mantras = ["You deserve care that feels like a soft place to land.", "Your body is not a problem to solve. She is someone to listen to.", "Tiny steps still count, especially on the tender days."];

export default function Login({ onLogin }: LoginProps) {
  const existingAccount = getLocalAccount();
  const [mode, setMode] = useState<"create" | "signin">(existingAccount ? "signin" : "create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(existingAccount?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mantra = useMemo(() => mantras[new Date().getDate() % mantras.length], []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (mode === "create" && name.trim().length < 2) return setError("Tell us your name so your space can feel like yours ✨");
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError("Pop in a valid email so we know where to welcome you ✨");
    if (password.length < 8) return setError("Your password needs at least 8 characters for a safer little space.");
    if (mode === "create" && password !== confirmPassword) return setError("Those passwords are not matching yet — try once more, lovely.");
    if (mode === "create" && getAccountByEmail(cleanEmail)) return setError("An account with this email already exists. Try signing in instead.");
    setError(""); setIsSubmitting(true);
    try {
      const account = mode === "create" ? await createLocalAccount(cleanEmail, password, name) : await verifyLocalAccount(cleanEmail, password);
      if (!account) { setError("That email or password didn’t match this device."); setIsSubmitting(false); return; }
      setSession(account);
      window.setTimeout(() => onLogin(account), 300);
    } catch (err) { setError(err instanceof Error && err.message === "ACCOUNT_EXISTS" ? "An account with this email already exists." : "Something gentle went wrong. Please try again."); setIsSubmitting(false); }
  }

  return <main className="login-page"><div className="login-orbit orbit-a" /><div className="login-orbit orbit-b" /><div className="login-spark spark-a">✦</div><div className="login-spark spark-b">✿</div>
    <section className="login-shell" aria-label="FemCare AI account access">
      <div className="login-story"><div className="login-brand"><span className="login-mark">F</span><span>FemCare <em>AI</em></span></div><div className="story-copy"><div className="story-kicker"><Sparkles size={13} /> a little corner for you</div><h1>Come as you are.<br /><i>Leave feeling held.</i></h1><p>Your cycle, your moods, your tiny wins — all deserve a kinder place to be understood.</p></div><div className="mantra-card"><div className="mantra-icon"><Heart size={17} fill="currentColor" /></div><div><span>Mira’s reminder for you</span><strong>“{mantra}”</strong></div></div><div className="story-footer"><span><Check size={13} /> private by design</span><span><Leaf size={13} /> gentle, never judgmental</span></div></div>
      <div className="login-card-wrap"><div className="login-card"><div className="login-card-top"><span className="tiny-label">{mode === "create" ? "YOUR SOFT STARTS HERE" : "WELCOME BACK, LOVELY"}</span><span className="star-badge"><Stars size={16} /></span></div><h2>{mode === "create" ? "Make your space." : "Hi again, lovely."}</h2><p className="login-subtitle">{mode === "create" ? "Create a private little space for your health journey." : "Your gentle health space is waiting for you."}</p>
        <form onSubmit={handleSubmit} noValidate>{mode === "create" && <><label className="login-label" htmlFor="name">Your name</label><div className={`email-field ${error ? "has-error" : ""}`}><UserRound size={18} /><input id="name" type="text" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="what should we call you?" /></div></>}<label className="login-label password-label" htmlFor="email">Your email</label><div className={`email-field ${error ? "has-error" : ""}`}><Mail size={18} /><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" /></div><label className="login-label password-label" htmlFor="password">{mode === "create" ? "Create a password (8+ characters)" : "Your password"}</label><div className={`email-field ${error ? "has-error" : ""}`}><LockKeyhole size={18} /><input id="password" type="password" autoComplete={mode === "create" ? "new-password" : "current-password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="at least 8 characters" /></div>{mode === "create" && <><label className="login-label password-label" htmlFor="confirm-password">Confirm password</label><div className={`email-field ${error ? "has-error" : ""}`}><LockKeyhole size={18} /><input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} placeholder="type it once more" /></div></>}{error && <p className="login-error" role="alert">{error}</p>}<button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Keeping your space safe…" : <>{mode === "create" ? "Create my account" : "Sign me in"} <ArrowRight size={17} /></>}</button></form>
        <div className="login-divider"><span>{mode === "create" ? "your data stays yours" : "good to see you"}</span></div><p className="login-note">Passwords are protected locally with salted browser encryption in this prototype.</p><button type="button" className="mode-switch" onClick={() => { setMode(mode === "create" ? "signin" : "create"); setError(""); }}>{mode === "create" ? "Already have an account? Sign in" : "New here? Create an account"}</button></div><div className="login-privacy"><span className="privacy-dot" /> Your account is stored securely on this device</div></div>
    </section></main>;
}
