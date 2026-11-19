"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoSession } from "@/components/auth/demo-session";
import { accessibleCompanies, employerCompany, companyRole, switchCompany } from "@/lib/employer-company";
import { companyRoles } from "@/lib/company-team";
import { usePlatform } from "./store";
import { Notice } from "./ui";

export function CompanySwitcher() {
  const { data, update, actorId } = usePlatform(); const { role } = useDemoSession(); const router = useRouter();
  const [error, setError] = useState("");
  const companies = accessibleCompanies(data, actorId); const current = employerCompany(data, actorId);
  const access = companyRole(data, actorId);
  return <div className="border-b border-line py-5">
    <label className="block text-xs font-medium">Текущая компания<select aria-label="Текущая компания" className="field mt-2" value={current?.id || ""} onChange={event => {
      const failure = update(draft => switchCompany(draft, event.target.value, actorId)); setError(failure || ""); if (!failure) router.push("/dashboard/employer");
    }}><option value="" disabled>Выбери компанию</option>{companies.map(company => <option key={company.id} value={company.id}>{company.name}{company.blocked ? " · скрыта" : ""}</option>)}</select></label>
    {access && <p className="mt-2 text-xs text-muted">{access === "owner" ? "Владелец компании" : companyRoles[access]}</p>}
    {role === "employer" && <Link href="/dashboard/employer/company/new" className="mt-3 block text-sm font-medium underline">+ Добавить компанию</Link>}
    <Notice error>{error}</Notice>
  </div>;
}
