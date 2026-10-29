"use client";
import { createContext, useContext, useSyncExternalStore } from "react";
import { Icon } from "./icon";
const key = "jobhub-favorites";
let memory = "[]";
const listeners = new Set<() => void>();
function snapshot() { try { return localStorage.getItem(key) || memory; } catch { return memory; } }
function subscribe(callback: () => void) { listeners.add(callback); window.addEventListener("storage", callback); return () => { listeners.delete(callback); window.removeEventListener("storage", callback); }; }
const Context = createContext<{ ids: string[]; toggle: (id: string) => void }>({ ids: [], toggle: () => {} });
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  let ids: string[] = [];
  try { const parsed: unknown = JSON.parse(raw); if (Array.isArray(parsed)) ids = parsed.filter((id): id is string => typeof id === "string"); } catch {}
  function toggle(id: string) {
    const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    memory = JSON.stringify(next);
    try { localStorage.setItem(key, memory); } catch {}
    listeners.forEach((callback) => callback());
  }
  return <Context.Provider value={{ ids, toggle }}>{children}</Context.Provider>;
}
export const useFavorites = () => useContext(Context);
export function SaveButton({ id, label = false }: { id: string; label?: boolean }) {
  const { ids, toggle } = useFavorites(); const saved = ids.includes(id);
  return <button onClick={() => toggle(id)} aria-pressed={saved} aria-label={saved ? "Убрать из избранного" : "Сохранить вакансию"} title={saved ? "Убрать из избранного" : "Сохранить вакансию"} className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 transition-colors ${saved ? "border-ink/20 bg-lime/50 text-ink" : "border-line bg-white text-muted hover:border-ink/40"} ${label ? "w-full py-3 text-sm font-medium" : ""}`}><Icon name="bookmark" className={saved ? "fill-current" : ""} />{label && (saved ? "В избранном" : "Сохранить вакансию")}</button>;
}
