export type StoredUser = {
  username: string;
  passwordHash: string;
  createdAt: string;
};

const USERS_KEY = "mtk_users";
const SESSION_KEY = "mtk_session";

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadUser(): StoredUser | null {
  try {
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!sessionRaw) return null;
    const { username } = JSON.parse(sessionRaw) as { username: string };
    const users = loadUsers();
    return users.find((u) => u.username === username) ?? null;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function registerUser(username: string, password: string): Promise<StoredUser> {
  const passwordHash = await sha256(password);
  const users = loadUsers();
  const existing = users.find((u) => u.username === username);
  if (existing) {
    throw new Error("Username already taken");
  }
  const user: StoredUser = { username, passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
  return user;
}

export async function verifyUser(username: string, password: string): Promise<boolean> {
  const users = loadUsers();
  const match = users.find((u) => u.username === username);
  if (!match) return false;
  const hash = await sha256(password);
  if (hash !== match.passwordHash) return false;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
  return true;
}

/** Demo helper: create a usable "demo" account with seeded data so /dashboard is instantly populated. */
export async function ensureDemoAccount(): Promise<StoredUser> {
  const users = loadUsers();
  const existing = users.find((u) => u.username === "demo");
  const user = existing ?? (await registerUser("demo", "demo1234"));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username }));

  // Seed demo data on first run so the dashboard has something to show.
  const { userData } = await import("./mockData");
  const { saveProfile, saveBudgets, saveTransactions, loadProfile } = await import("./userStore");
  const { loadGoals, saveGoals, goalsFromJars } = await import("./goals");
  if (!loadProfile()) {
    saveProfile({ income: userData.income, balance: userData.balance });
    saveBudgets(userData.budgets);
    saveTransactions(userData.transactions);
  }
  if (loadGoals().length === 0) {
    saveGoals(goalsFromJars(userData.jars));
  }

  return user;
}
