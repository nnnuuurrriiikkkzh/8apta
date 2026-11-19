"use client";
import { CitySelect } from "@/components/city-select";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Avatar } from "./shell";
import { readAttachment, useSeeker } from "./store";
import type { SeekerProfile } from "@/lib/seeker";

export function ProfilePage() {
  const { data, save } = useSeeker();
  const [draft, setDraft] = useState<SeekerProfile>({ ...data.profile });
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.profile);

  function change(key: keyof SeekerProfile, value: string) {
    setDraft(current => ({ ...current, [key]: value }));
    setNotice(""); setError("");
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(""); setNotice(""); setReading(true);
    try { change("avatar", await readAttachment(file, "avatar")); }
    catch (error) { setError(error instanceof Error ? error.message : "Не удалось загрузить фото."); }
    finally { setReading(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reading) return;
    if (draft.name.trim().length < 2) { setError("Имя должно содержать минимум 2 символа."); return; }
    const profile = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as SeekerProfile;
    const failure = save(current => ({ ...current, profile }));
    if (failure) { setError(failure); return; }
    setDraft(profile); setError(""); setNotice("Профиль сохранён в этом браузере.");
  }

  return <>
    <h1 className="text-3xl font-semibold tracking-tight">Мой профиль</h1><p className="mt-3 text-sm leading-6 text-muted">Основная информация для твоего кабинета. Данные существующих резюме редактируются отдельно.</p>
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-5 border-b border-line pb-6"><Avatar name={draft.name} src={draft.avatar} large /><div className="min-w-0"><label htmlFor="profile-avatar" className="block text-sm font-semibold">Фото профиля</label><input id="profile-avatar" type="file" accept="image/png,image/jpeg,image/webp" disabled={reading} onChange={upload} className="mt-2 block w-full max-w-xs text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-line file:bg-paper file:px-3 file:py-2 file:text-ink" /><p className="mt-2 text-xs text-muted">PNG, JPEG или WebP, до 512 КБ.</p>{draft.avatar && <button type="button" disabled={reading} onClick={() => change("avatar", "")} className="mt-2 text-xs underline">Удалить фото</button>}</div></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {([
          ["name", "Имя и фамилия", "text", "name", true],
          ["title", "Желаемая должность", "text", "organization-title", false],
          ["email", "Email", "email", "email", true],
          ["phone", "Телефон", "tel", "tel", false],
          ["city", "Город", "text", "address-level2", false],
        ] as const).map(([key, label, type, autoComplete, required]) => <label key={key} className="text-sm font-medium">{label}{required && <span className="text-muted"> *</span>}{key === "city" ? <CitySelect name={key} value={draft.city} onChange={event => change("city", event.target.value)} className="field mt-2" /> : <input name={key} value={draft[key]} onChange={event => change(key, event.target.value)} type={type} autoComplete={autoComplete} required={required} maxLength={key === "email" ? 254 : 100} className="field mt-2" />}</label>)}
      </div>
      <label className="mt-5 block text-sm font-medium">О себе<textarea value={draft.bio} onChange={event => change("bio", event.target.value)} rows={5} maxLength={1500} placeholder="Чем ты занимаешься и какую работу ищешь?" className="field mt-2 resize-y" /></label><p className="mt-1 text-right text-xs text-muted">{draft.bio.length} / 1500</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-[#fcece9] p-3 text-sm text-[#a4352d]">{error}</p>}
      <p role="status" className="mt-4 text-sm text-[#526c31]">{reading ? "Читаем фото…" : notice}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5"><button disabled={reading} className="btn btn-primary">Сохранить профиль</button><button type="button" disabled={reading || !dirty} onClick={() => { setDraft({ ...data.profile }); setError(""); setNotice("Изменения отменены."); }} className="btn btn-light">Отменить изменения</button>{dirty && <span className="text-xs text-muted">Есть несохранённые изменения</span>}</div>
    </form>
  </>;
}
