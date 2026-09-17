import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { clearLocalAccount, getLocalAccount } from "@/lib/auth";

const SESSION_KEY = "femcare-login-email";

export default function App() {
  const [email, setEmail] = useState(() => {
    const account = getLocalAccount();
    const session = window.localStorage.getItem(SESSION_KEY);
    return account && session === account.email ? session : null;
  });

  function handleLogin(nextEmail: string) {
    window.localStorage.setItem(SESSION_KEY, nextEmail);
    setEmail(nextEmail);
  }

  function handleLogout() {
    clearLocalAccount();
    setEmail(null);
  }

  return email ? <Home onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}
