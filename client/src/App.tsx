import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";

const LOGIN_KEY = "femcare-login-email";

export default function App() {
  const [email, setEmail] = useState(() => window.localStorage.getItem(LOGIN_KEY));

  function handleLogin(nextEmail: string) {
    window.localStorage.setItem(LOGIN_KEY, nextEmail);
    setEmail(nextEmail);
  }

  return email ? <Home /> : <Login onLogin={handleLogin} />;
}
