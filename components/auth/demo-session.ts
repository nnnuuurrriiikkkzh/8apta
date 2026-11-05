"use client";

import { useSyncExternalStore } from "react";
import { type Role, roleHomes } from "@/lib/platform";

// Только состояние интерфейса. Этот флаг не является серверной авторизацией.
const key = "jobhub-demo-session";
const accountRoleKey = "jobhub-demo-account-role";
const listeners = new Set<() => void>();
let fallback: string | null = null;

function snapshot() {
  if (fallback !== null) return fallback;
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  function onStorage(event: StorageEvent) {
    if (event.key === key || event.key === null) { fallback = null; callback(); }
  }
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(callback); window.removeEventListener("storage", onStorage); };
}

function setSignedIn(active: boolean, role: Role = "seeker") {
  try {
    if (active) localStorage.setItem(key, role);
    else localStorage.removeItem(key);
    fallback = null;
  } catch {
    // При недоступном хранилище вход работает до перезагрузки страницы.
    fallback = active ? role : "";
  }
  listeners.forEach(callback => callback());
}

export function useDemoSession() {
  const value = useSyncExternalStore(subscribe, snapshot, () => "");
  const role: Role = ["employer", "moderator", "admin"].includes(value) ? value as Role : "seeker";
  function signIn(selectedRole?: Role) {
    let next = selectedRole;
    if (!next) { try { next = localStorage.getItem(accountRoleKey) === "employer" ? "employer" : "seeker"; } catch { next = "seeker"; } }
    setSignedIn(true, next);
  }
  function registerRole(next: "seeker" | "employer") {
    try { localStorage.setItem(accountRoleKey, next); } catch { /* UI role still works for this visit. */ }
    setSignedIn(true, next);
  }
  return { signedIn: Boolean(value), role, home: roleHomes[role], signIn, registerRole, signOut: () => setSignedIn(false) };
}
