"use client";
import { createContext, useContext, useSyncExternalStore } from "react";
import { Icon } from "./icon";
import { demoFavoriteIds } from "@/lib/seeker-demo";
const key = "jobhub-favorites";
const seed = JSON.stringify({ version: 1, ids: demoFavoriteIds });
let memory: string | null = null;
const listeners = new Set<() => void>();
function snapshot() { if (memory !== null) return memory; try { return localStorage.getItem(key) || seed; } catch { return seed; } }
function subscribe(callback: () => void) { listeners.add(callback); window.addEventListener("storage", callback); return () => { listeners.delete(callback); window.removeEventListener("storage", callback); }; }
const Context = createContext<{ ids: string[]; toggle: (id: string) => void }>({ ids: [], toggle: () => {} });
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => seed);
  let ids: string[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) ids = Array.from(new Set([...parsed.filter((id): id is string => typeof id === "string"), ...demoFavoriteIds]));
    else if (parsed?.version === 1 && Array.isArray(parsed.ids)) ids = parsed.ids.filter((id: unknown): id is string => typeof id === "string");
    else ids = demoFavoriteIds;
  } catch { ids = demoFavoriteIds; }
  function toggle(id: string) {
    const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    const value = JSON.stringify({ version: 1, ids: next });
    try { localStorage.setItem(key, value); memory = null; } catch { memory = value; }
    listeners.forEach((callback) => callback());
  }
  return <Context.Provider value={{ ids, toggle }}>{children}</Context.Provider>;
}
export const useFavorites = () => useContext(Context);
export function SaveButton({ id, label = false }: { id: string; label?: boolean }) {
  const { ids, toggle } = useFavorites(); const saved = ids.includes(id);
  return <button onClick={() => toggle(id)} aria-pressed={saved} aria-label={saved ? "Убрать из избранного" : "Сохранить вакансию"} title={saved ? "Убрать из избранного" : "Сохранить вакансию"} className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 transition-colors ${saved ? "border-ink/20 bg-lime/50 text-ink" : "border-line bg-white text-muted hover:border-ink/40"} ${label ? "w-full py-3 text-sm font-medium" : ""}`}><Icon name="bookmark" className={saved ? "fill-current" : ""} />{label && (saved ? "В избранном" : "Сохранить вакансию")}</button>;
}
