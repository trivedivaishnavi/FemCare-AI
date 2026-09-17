import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Check, Heart, Leaf, Mail, Sparkles, Stars } from "lucide-react";

type LoginProps = { onLogin: (email: string) => void };

const mantras = [
  "You deserve care that feels like a soft place to land.",
  "Your body is not a problem to solve. She is someone to listen to.",
  "Tiny steps still count, especially on the tender days.",
];

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mantra = useMemo(() => mantras[new Date().getDate() % mantras.length], []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Pop in a valid email so we know where to welcome you ✨");
      return;
    }
    setError("");
    setIsSubmitting(true);
    window.setTimeout(() => onLogin(cleanEmail), 420);
  }

  return (
    <main className="login-page">
      <div className="login-orbit orbit-a" /><div className="login-orbit orbit-b" />
      <div className="login-spark spark-a">✦</div><div className="login-spark spark-b">✿</div>
      <section className="login-shell" aria-label="FemCare AI sign in">
        <div className="login-story">
          <div className="login-brand"><span className="login-mark">F</span><span>FemCare <em>AI</em></span></div>
          <div className="story-copy">
            <div className="story-kicker"><Sparkles size={13} /> a little corner for you</div>
            <h1>Come as you are.<br /><i>Leave feeling held.</i></h1>
            <p>Your cycle, your moods, your tiny wins — all deserve a kinder place to be understood.</p>
          </div>
          <div className="mantra-card"><div className="mantra-icon"><Heart size={17} fill="currentColor" /></div><div><span>Mira’s reminder for you</span><strong>“{mantra}”</strong></div></div>
          <div className="story-footer"><span><Check size={13} /> private by design</span><span><Leaf size={13} /> gentle, never judgmental</span></div>
        </div>
        <div className="login-card-wrap">
          <div className="login-card">
            <div className="login-card-top"><span className="tiny-label">YOUR SOFT STARTS HERE</span><span className="star-badge"><Stars size={16} /></span></div>
            <h2>Hi, lovely.</h2>
            <p className="login-subtitle">Let’s make space for what your body has been trying to tell you.</p>
            <form onSubmit={handleSubmit} noValidate>
              <label className="login-label" htmlFor="email">Your email</label>
              <div className={`email-field ${error ? "has-error" : ""}`}><Mail size={18} /><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" /></div>
              {error && <p className="login-error" role="alert">{error}</p>}
              <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Making your little space…" : <>Enter my space <ArrowRight size={17} /></>}</button>
            </form>
            <div className="login-divider"><span>made for real life</span></div>
            <p className="login-note">No perfect routines required. Just your honest little self.</p>
          </div>
          <div className="login-privacy"><span className="privacy-dot" /> Your email stays yours in this prototype</div>
        </div>
      </section>
    </main>
  );
}
