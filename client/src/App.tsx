import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { clearSession, getLocalAccount, setSession } from "@/lib/auth";
import type { LocalAccount } from "@/lib/auth";

const SESSION_KEY = "femcare-login-email";

export default function App() {
  const [account, setAccount] = useState<LocalAccount | null>(() => {
    const current = getLocalAccount();
    const session = window.localStorage.getItem("femcare-login-id");
    return current && (session === current.id || window.localStorage.getItem(SESSION_KEY) === current.email) ? current : null;
  });

  function handleLogin(nextAccount: LocalAccount) {
    setSession(nextAccount);
    setAccount(nextAccount);
  }

  function handleLogout() {
    clearSession();
    setAccount(null);
  }

  return account ? <Home account={account} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}
