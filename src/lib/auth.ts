import { v4 as uuidv4 } from "uuid";

const USER_KEY = "lct_user";

export interface LocalUser {
  id: string;
  pseudo: string;
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

export function saveLocalUser(pseudo: string): LocalUser {
  const user: LocalUser = { id: uuidv4(), pseudo };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearLocalUser(): void {
  localStorage.removeItem(USER_KEY);
}
