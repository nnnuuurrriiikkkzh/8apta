"use client";

import { useSyncExternalStore } from "react";
import { initialSeekerData, type SeekerData } from "@/lib/seeker";

const key = "jobhub-seeker-v1";
const seed = JSON.stringify(initialSeekerData);
const listeners = new Set<() => void>();
function snapshot() { try { return localStorage.getItem(key) || seed; } catch { return seed; } }
function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => { listeners.delete(callback); window.removeEventListener("storage", callback); };
}
function parse(raw: string): SeekerData {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !value.profile || !Array.isArray(value.resumes)) return initialSeekerData;
    if (!Object.keys(initialSeekerData.profile).every(key => typeof value.profile[key] === "string")) return initialSeekerData;
    if (!value.resumes.every((item: Record<string, unknown>) => item && Object.keys(initialSeekerData.resumes[0]).every(key => typeof item[key] === "string") && ["private", "application"].includes(String(item.visibility)))) return initialSeekerData;
    return value;
  } catch { return initialSeekerData; }
}

export function useSeeker() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => seed);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const data = parse(raw);
  function save(change: (current: SeekerData) => SeekerData): string | null {
    try {
      localStorage.setItem(key, JSON.stringify(change(parse(snapshot()))));
      listeners.forEach(callback => callback());
      return null;
    } catch {
      return "Не удалось сохранить изменения. Проверь доступ к хранилищу браузера или уменьши размер вложений.";
    }
  }
  return { data, ready, save };
}

export async function readAttachment(file: File, kind: "avatar" | "pdf"): Promise<string> {
  const limit = kind === "avatar" ? 512 * 1024 : 1024 * 1024;
  const types = kind === "avatar" ? ["image/png", "image/jpeg", "image/webp"] : ["application/pdf"];
  if (!types.includes(file.type)) throw new Error(kind === "avatar" ? "Выбери PNG, JPEG или WebP." : "Выбери файл в формате PDF.");
  if (file.size > limit) throw new Error(kind === "avatar" ? "Фото должно быть не больше 512 КБ." : "PDF должен быть не больше 1 МБ.");
  if (kind === "pdf") {
    const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
    if (header !== "%PDF-") throw new Error("Файл не похож на PDF. Выбери другой документ.");
  }
  const result = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл. Попробуй ещё раз."));
    reader.readAsDataURL(file);
  });
  if (kind === "avatar") {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Изображение повреждено. Выбери другое фото."));
      image.src = result;
    });
  }
  return result;
}
