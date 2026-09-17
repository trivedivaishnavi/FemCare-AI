const ACCOUNTS_KEY = "femcare-local-accounts";

export type LocalAccount = {
  id: string;
  email: string;
  name: string;
  salt: string;
  verifier: string;
  createdAt: string;
};

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...Array.from(bytes)));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveVerifier(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, material, 256);
  return bytesToBase64(new Uint8Array(bits));
}

function readAccounts(): LocalAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw) as LocalAccount[];
    const legacy = window.localStorage.getItem("femcare-local-account");
    if (legacy) {
      const old = JSON.parse(legacy) as Partial<LocalAccount> & { email: string };
      const migrated: LocalAccount = { id: crypto.randomUUID(), email: old.email, name: old.name || old.email.split("@")[0], salt: old.salt || "", verifier: old.verifier || "", createdAt: new Date().toISOString() };
      writeAccounts([migrated]);
      return [migrated];
    }
  } catch { /* corrupted local data is treated as empty */ }
  return [];
}

function writeAccounts(accounts: LocalAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getLocalAccounts() { return readAccounts(); }

export function getLocalAccount() {
  const session = window.localStorage.getItem("femcare-login-id");
  const accounts = readAccounts();
  return accounts.find((account) => account.id === session) || accounts[0] || null;
}

export function getAccountByEmail(email: string) {
  return readAccounts().find((account) => account.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

export async function createLocalAccount(email: string, password: string, name: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (getAccountByEmail(normalizedEmail)) throw new Error("ACCOUNT_EXISTS");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const verifier = await deriveVerifier(password, salt);
  const account: LocalAccount = { id: crypto.randomUUID(), email: normalizedEmail, name: name.trim() || normalizedEmail.split("@")[0], salt: bytesToBase64(salt), verifier, createdAt: new Date().toISOString() };
  writeAccounts([...readAccounts(), account]);
  return account;
}

export async function verifyLocalAccount(email: string, password: string) {
  const account = getAccountByEmail(email);
  if (!account) return null;
  const verifier = await deriveVerifier(password, base64ToBytes(account.salt));
  return verifier === account.verifier ? account : null;
}

export function clearSession() {
  window.localStorage.removeItem("femcare-login-id");
  window.localStorage.removeItem("femcare-login-email");
}

export function setSession(account: LocalAccount) {
  window.localStorage.setItem("femcare-login-id", account.id);
  window.localStorage.setItem("femcare-login-email", account.email);
}

export function clearLocalAccount() {
  clearSession();
  window.localStorage.removeItem("femcare-local-account");
  window.localStorage.removeItem(ACCOUNTS_KEY);
}
