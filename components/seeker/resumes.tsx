"use client";
import { CompanyText } from "@/components/company-link";

import { useEffect, useRef, useState } from "react";
import { blankResume, type Resume } from "@/lib/seeker";
import { Icon } from "@/components/icon";
import { ResumeEditor } from "./resume-editor";
import { useSeeker } from "./store";

type Modal = { kind: "edit" | "preview" | "delete"; resume: Resume } | null;
function updatedLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Недавно" : date.toLocaleDateString("ru-RU");
}

export function ResumesPage() {
  const { data, save } = useSeeker();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const filtered = data.resumes.filter(resume => `${resume.title} ${resume.skills}`.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru")));
  useEffect(() => { if (modal) dialog.current?.showModal(); else dialog.current?.close(); }, [modal]);

  function open(kind: NonNullable<Modal>["kind"], resume: Resume) { setError(""); setModal({ kind, resume }); }
  function saveResume(resume: Resume) {
    const failure = save(current => ({ ...current, resumes: resume.id ? current.resumes.map(item => item.id === resume.id ? resume : item) : [...current.resumes, { ...resume, id: crypto.randomUUID() }] }));
    if (failure) return failure;
    setModal(null); setNotice("Резюме сохранено в этом браузере."); return null;
  }
  function remove() {
    if (!modal) return;
    const failure = save(current => ({ ...current, resumes: current.resumes.filter(resume => resume.id !== modal.resume.id) }));
    if (failure) { setError(failure); return; }
    setModal(null); setNotice("Резюме удалено.");
  }

  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight">Мои резюме</h1><p className="mt-3 text-sm text-muted">Подготовь отдельное резюме для каждого направления.</p></div><button onClick={() => open("edit", blankResume(data.profile))} className="btn btn-primary">Создать резюме <Icon name="arrow" className="size-4" /></button></div>
    <label className="mt-6 block text-sm font-medium">Поиск по резюме<input className="field mt-2" value={query} onChange={event => setQuery(event.target.value)} placeholder="Название или навык" /></label>
    <p role="status" className="my-4 text-sm text-[#526c31]">{notice}</p>
    <p className="mb-4 text-xs text-muted" aria-live="polite">Резюме: {filtered.length} из {data.resumes.length}</p>
    <div className="space-y-4">{filtered.map(resume => <article key={resume.id} className="rounded-2xl border border-line bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-xl font-semibold">{resume.title}</h2><p className="mt-2 text-sm text-muted">{resume.city} · Обновлено {updatedLabel(resume.updatedAt)}</p></div><Icon name="briefcase" className="text-[#8c9b73]" /></div><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#eef3e5] px-3 py-1.5">{resume.visibility === "private" ? "Только для меня" : "Для отклика"}</span>{resume.fileName && <span className="rounded-full bg-[#eef0f6] px-3 py-1.5">PDF прикреплён</span>}</div><p className="mt-4 line-clamp-2 whitespace-pre-line break-words text-sm leading-6 text-muted"><CompanyText text={resume.summary || "Добавь краткое описание опыта и сильных сторон."} /></p><div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4"><button className="btn btn-light" onClick={() => open("preview", resume)}>Предпросмотр</button><button className="btn btn-light" onClick={() => open("edit", resume)}>Редактировать</button><button className="rounded-lg px-3 py-2 text-sm text-[#a4352d] hover:bg-[#fcece9]" onClick={() => open("delete", resume)}>Удалить</button></div></article>)}</div>
    {!filtered.length && <div className="rounded-2xl border border-dashed border-[#cbd8b8] bg-white px-5 py-12 text-center"><Icon name="briefcase" className="mx-auto size-9 text-[#83975c]" /><h2 className="mt-4 text-xl font-semibold">{data.resumes.length ? "Резюме не найдены" : "Начни с первого резюме"}</h2><p className="mt-3 text-sm leading-6 text-muted">{data.resumes.length ? "Попробуй другой запрос или очисти поиск." : "Расскажи об опыте, образовании и навыках — всё можно дополнить позже."}</p><button className="btn btn-primary mt-5" onClick={() => data.resumes.length ? setQuery("") : open("edit", blankResume(data.profile))}>{data.resumes.length ? "Очистить поиск" : "Создать первое резюме"}</button></div>}
    <dialog ref={dialog} onCancel={() => setModal(null)} aria-labelledby="resume-modal-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-2xl overflow-y-auto rounded-2xl border border-line bg-white p-5 text-ink shadow-2xl sm:p-8">
      {modal && <><div className="flex items-start justify-between gap-3"><h2 id="resume-modal-title" className="min-w-0 break-words text-2xl font-semibold">{modal.kind === "delete" ? "Удалить резюме?" : modal.kind === "edit" ? (modal.resume.id ? "Редактирование резюме" : "Новое резюме") : modal.resume.title}</h2><button autoFocus aria-label="Закрыть окно резюме" onClick={() => setModal(null)} className="shrink-0 rounded-lg p-2 hover:bg-paper"><Icon name="close" /></button></div>
        {modal.kind === "edit" && <ResumeEditor key={modal.resume.id || "new"} initial={modal.resume} onSave={saveResume} onCancel={() => setModal(null)} />}
        {modal.kind === "delete" && <><p className="mt-4 break-words text-sm leading-6 text-muted">«{modal.resume.title}» и его PDF-вложение будут удалены из этого браузера. Это действие нельзя отменить.</p>{error && <p role="alert" className="mt-4 text-sm text-[#a4352d]">{error}</p>}<div className="mt-6 flex flex-wrap gap-3"><button onClick={() => setModal(null)} className="btn btn-light">Оставить резюме</button><button onClick={remove} className="btn bg-[#a4352d] text-white">Подтвердить удаление</button></div></>}
        {modal.kind === "preview" && <div className="mt-5 space-y-5"><div className="border-b border-line pb-4"><p className="break-words text-lg font-semibold">{modal.resume.name}</p><p className="mt-2 break-words text-sm text-muted">{modal.resume.city} · {modal.resume.email}{modal.resume.phone && ` · ${modal.resume.phone}`}</p></div>{([
          ["О себе", modal.resume.summary], ["Навыки", modal.resume.skills], ["Опыт работы", modal.resume.experience], ["Образование", modal.resume.education], ["Языки", modal.resume.languages],
        ]).map(([title, value]) => <section key={title}><h3 className="font-semibold">{title}</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted"><CompanyText text={value || "Не указано"} /></p></section>)}{/^https?:\/\//i.test(modal.resume.portfolio) && <a href={modal.resume.portfolio} target="_blank" rel="noopener noreferrer" className="block break-all text-sm underline">Открыть портфолио ↗</a>}{modal.resume.fileData.startsWith("data:application/pdf;base64,") && <a href={modal.resume.fileData} download={modal.resume.fileName || "resume.pdf"} className="btn btn-light">Скачать PDF</a>}<div className="border-t border-line pt-5"><button onClick={() => open("edit", modal.resume)} className="btn btn-primary">Редактировать резюме</button></div></div>}
      </>}
    </dialog>
  </>;
}
