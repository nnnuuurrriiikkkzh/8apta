"use client";
import { useSyncExternalStore } from "react";
import { initialPlatform, type Platform } from "@/lib/platform";
import { addSeekerDemo } from "@/lib/seeker-demo";
import { createCachedBrowserStore } from "@/lib/cached-browser-store";
import type { Role } from "@/lib/platform";
import { initialSupportTickets } from "@/lib/support";
import { CompanyRegistrationError } from "@/lib/employer-company";
import { useDemoSession } from "@/components/auth/demo-session";

const key = "jobhub-platform-v1";
const seed = JSON.stringify(initialPlatform);
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
function parse(raw: string): Platform {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !["jobs", "companies", "applications", "messages", "notifications", "reports", "history", "users", "categories"].every(k => Array.isArray(value[k])) || !value.preferences || !value.settings) return initialPlatform;
    const legacy = value.companies.find((company: Platform["companies"][number]) => company.id === value.employerCompanyId);
    if (legacy && !legacy.ownerId) { legacy.ownerId = value.employerAccountId || "hr"; legacy.ownerName = value.users.find((user: Platform["users"][number]) => user.id === "hr")?.name; }
    return addSeekerDemo({ ...value, companyMembers: Array.isArray(value.companyMembers) ? value.companyMembers : [], teamRequests: Array.isArray(value.teamRequests) ? value.teamRequests : [], activeCompanyIds: value.activeCompanyIds || {}, searches: Array.isArray(value.searches) ? value.searches : [], supportTickets: Array.isArray(value.supportTickets) ? value.supportTickets : initialSupportTickets });
  } catch { return initialPlatform; }
}
const store = createCachedBrowserStore({ read: snapshot, parse, initial: initialPlatform, keys: [key, "jobhub-demo-application-statuses"] });
function update(change: (draft: Platform) => void): string | null {
    try {
      const draft = structuredClone(store.getFreshSnapshot());
      change(draft);
      localStorage.setItem(key, JSON.stringify(draft));
      store.refresh();
      return null;
    } catch (error) { return error instanceof CompanyRegistrationError ? error.message : "Не удалось сохранить изменения. Проверь свободное место и доступ к хранилищу браузера."; }
}
export function usePlatform() {
  const { role } = useDemoSession();
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const ready = useSyncExternalStore(store.subscribe, () => true, () => false);
  const actorId = role === "employer" ? data.employerAccountId || "hr" : role === "seeker" ? data.seekerAccountId || "me" : role;
  return { data, ready, update, actorId };
}

export function useUnreadNotifications(role: Role) {
  const count = (data: Platform) => data.notifications.filter(n => n.role === role && !n.read).length;
  return useSyncExternalStore(store.subscribe, () => count(store.getSnapshot()), () => count(initialPlatform));
}
