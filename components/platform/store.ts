"use client";
import { useMemo, useSyncExternalStore } from "react";
import { initialPlatform, type Platform } from "@/lib/platform";
import { addSeekerDemo } from "@/lib/seeker-demo";

const key = "jobhub-platform-v1";
const seed = JSON.stringify(initialPlatform);
const listeners = new Set<() => void>();
function snapshot() {
  try {
    const current = localStorage.getItem(key);
    if (current) return current;
    const legacy = localStorage.getItem("jobhub-demo-application-statuses");
    if (!legacy) return seed;
    const statuses = JSON.parse(legacy);
    return JSON.stringify({ ...initialPlatform, applications: initialPlatform.applications.map(a => ({ ...a, status: ["Submitted", "Viewed", "Interview", "Accepted", "Rejected", "Withdrawn"].includes(statuses?.[a.id]) ? statuses[a.id] : a.status })) });
  } catch { return seed; }
}
function subscribe(cb: () => void) { listeners.add(cb); window.addEventListener("storage", cb); return () => { listeners.delete(cb); window.removeEventListener("storage", cb); }; }
function parse(raw: string): Platform {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !["jobs", "companies", "applications", "messages", "notifications", "reports", "history", "users", "categories"].every(k => Array.isArray(value[k])) || !value.preferences || !value.settings) return initialPlatform;
    return addSeekerDemo({ ...value, searches: Array.isArray(value.searches) ? value.searches : [] });
  } catch { return initialPlatform; }
}
export function usePlatform() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => seed);
  const data = useMemo(() => parse(raw), [raw]);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  function update(change: (draft: Platform) => void): string | null {
    try {
      const draft = structuredClone(parse(snapshot()));
      change(draft);
      localStorage.setItem(key, JSON.stringify(draft));
      listeners.forEach(cb => cb());
      return null;
    } catch { return "Не удалось сохранить изменения. Проверь свободное место и доступ к хранилищу браузера."; }
  }
  return { data, ready, update };
}
