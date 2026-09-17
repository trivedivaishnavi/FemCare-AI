const ACCOUNT_KEY = "femcare-local-account";

export type LocalAccount = { email: string; salt: string; verifier: string };

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

export function getLocalAccount(): LocalAccount | null {
  const raw = window.localStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as LocalAccount; } catch { return null; }
}

export async function createLocalAccount(email: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const verifier = await deriveVerifier(password, salt);
  const account = { email, salt: bytesToBase64(salt), verifier };
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  return account;
}

export async function verifyLocalAccount(email: string, password: string) {
  const account = getLocalAccount();
  if (!account || account.email.toLowerCase() !== email.toLowerCase()) return false;
  const verifier = await deriveVerifier(password, base64ToBytes(account.salt));
  return verifier === account.verifier;
}

export function clearLocalAccount() {
  window.localStorage.removeItem(ACCOUNT_KEY);
  window.localStorage.removeItem("femcare-login-email");
}
