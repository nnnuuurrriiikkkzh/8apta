"use client";
import Link from "next/link";
import { useState } from "react";
import { useDemoSession } from "@/components/auth/demo-session";
import { useRequireSignIn } from "@/components/auth/require-sign-in";
import { useSeeker } from "@/components/seeker/store";
import { companyOwnerId, companyRole } from "@/lib/employer-company";
import { companyRoles, requestTeamAccess, teamRequestStatuses, type CompanyRole } from "@/lib/company-team";
import type { Company } from "@/lib/platform";
import { usePlatform } from "./store";
import { Field, Modal, Notice, Panel } from "./ui";

export function TeamJoin({ company }: { company: Company }) {
  const { data, update, actorId } = usePlatform(); const { data: seeker } = useSeeker(); const { signedIn, role } = useDemoSession(); const requireSignIn = useRequireSignIn();
  const [open, setOpen] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  if (!companyOwnerId(data, company)) return null;
  const access = signedIn ? companyRole(data, actorId, company.id) : null;
  const request = signedIn ? data.teamRequests?.find(item => item.companyId === company.id && item.userId === actorId) : undefined;
  const home = role === "employer" ? "/dashboard/employer/memberships" : "/dashboard/seeker/team";
  return <Panel><h2 className="text-lg font-semibold">Команда компании</h2><p className="mt-3 text-sm leading-6 text-muted">Хочешь помогать с вакансиями и подбором? Отправь заявку на доступ к рабочему кабинету.</p>
    {access ? <Link href={home} className="btn btn-light mt-4">Мои компании и роли →</Link> : request?.status === "Pending" ? <p className="mt-4 text-sm font-medium">{teamRequestStatuses.Pending}</p> : <button className="btn btn-light mt-4" onClick={() => { if (requireSignIn()) setOpen(true); }}>Подать заявку в команду</button>}
    <Notice>{notice}</Notice>
    {open && <Modal title="Заявка в команду" onClose={() => setOpen(false)}><form className="space-y-5" onSubmit={event => {
      event.preventDefault(); if (!requireSignIn()) return; const form = new FormData(event.currentTarget);
      const profile = role === "seeker" ? seeker.profile : data.users.find(user => user.id === "hr");
      const failure = update(draft => requestTeamAccess(draft, { companyId: company.id, userId: actorId, name: profile?.name || "", email: profile?.email || "", role: String(form.get("role")) as CompanyRole, message: String(form.get("message")).trim(), accountRole: role }));
      setError(failure || ""); if (!failure) { setOpen(false); setNotice("Заявка отправлена. Решение появится в разделе «Мои команды»."); }
    }}><p className="text-sm text-muted">{company.name} · Владелец рассмотрит заявку и назначит роль.</p><Field label="Желаемая роль"><select className="field" name="role" defaultValue="recruiter">{Object.entries(companyRoles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="О себе и опыте"><textarea className="field" required minLength={10} maxLength={2000} name="message" rows={4} /></Field><Notice error>{error}</Notice><button className="btn btn-primary">Отправить заявку</button></form></Modal>}
  </Panel>;
}
