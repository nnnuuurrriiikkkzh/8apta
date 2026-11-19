"use client";
import { cloneElement, isValidElement, useEffect, useId, useRef, type ReactElement, type ReactNode } from "react";
import Link from "next/link";

export function Heading({ title, text, action }: { title: ReactNode; text?: string; action?: ReactNode }) { return <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow mb-3 text-muted">JOBHUB · ТВОЙ СЛЕДУЮЩИЙ ШАГ</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>{text && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{text}</p>}</div>{action}</div>; }
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`min-w-0 rounded-2xl border border-line bg-white p-5 sm:p-6 ${className}`}>{children}</div>; }
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) { return children ? <p role={error ? "alert" : "status"} className={`my-4 rounded-xl p-4 text-sm leading-6 ${error ? "bg-red-50 text-red-800" : "bg-[#edf3e3] text-ink"}`}>{children}</p> : null; }
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "red" | "amber" }) { return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone === "green" ? "bg-[#e9f3d9] text-[#426327]" : tone === "red" ? "bg-red-50 text-red-800" : tone === "amber" ? "bg-amber-50 text-amber-900" : "bg-[#f0f2ec] text-muted"}`}>{children}</span>; }
export function Empty({ title = "Пока ничего нет", text, href, label = "Найти вакансии", headingLevel = "h2" }: { title?: string; text: string; href?: string; label?: string; headingLevel?: "h1" | "h2" }) { const Title = headingLevel; return <Panel className="py-14 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-lime text-2xl">↗</span><Title className="mt-5 text-xl font-semibold">{title}</Title><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">{text}</p>{href && <Link href={href} className="btn btn-primary mt-6">{label}</Link>}</Panel>; }
export function Field({ label, children }: { label: string; children: ReactNode }) {
  const generated = useId();
  const child = isValidElement(children) ? children as ReactElement<{ id?: string }> : null;
  const id = child?.props.id || generated;
  return <div className="min-w-0 text-sm font-medium"><label htmlFor={id} className="mb-2 block">{label}</label>{child ? cloneElement(child, { id }) : children}</div>;
}
export function Stats({ items }: { items: [string, string | number][] }) { return <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(([label, value]) => <Panel key={label}><p className="text-xs text-muted">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p></Panel>)}</div>; }
export function Modal({ title, children, onClose }: { title: ReactNode; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const el = ref.current; el?.showModal(); return () => el?.close(); }, []);
  return <dialog ref={ref} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="modal-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-2xl overflow-y-auto rounded-2xl border border-line bg-paper p-5 text-ink shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between gap-4"><h2 id="modal-title" className="min-w-0 text-2xl font-semibold [overflow-wrap:anywhere]">{title}</h2><button type="button" aria-label="Закрыть окно" onClick={onClose} className="shrink-0 rounded-lg px-3 py-1 text-xl hover:bg-line">×</button></div>{children}</dialog>;
}
export function Bars({ items }: { items: [string, number][] }) { const max = Math.max(1, ...items.map(([,v]) => v)); return <div className="space-y-5">{items.map(([label, value]) => <div key={label}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{label}</span><strong>{value}</strong></div><div className="h-3 overflow-hidden rounded-full bg-[#f0f2ec]"><div className="h-full rounded-full bg-[#a8c76b] transition-all" style={{ width: `${value / max * 100}%` }} /></div></div>)}</div>; }
