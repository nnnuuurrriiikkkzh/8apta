"use client";

import { type CompanyDetails, type CompanyErrors } from "@/lib/employer-company";

export function CompanyFields({ value, onChange, errors = {}, disabled = false }: { value: CompanyDetails; onChange: (key: keyof CompanyDetails, value: string) => void; errors?: CompanyErrors; disabled?: boolean }) {
  const fields = [
    ["name", "Название компании", "Например, Nova Studio", 120],
    ["city", "Город компании", "Алматы", 80],
    ["industry", "Сфера деятельности", "Разработка ПО, образование, торговля…", 120],
    ["size", "Размер команды", "Например, 11–50 сотрудников", 80],
    ["email", "Email компании", "team@example.com", 254],
    ["website", "Сайт компании (необязательно)", "https://example.com", 500],
  ] as const;
  return <fieldset disabled={disabled} className="min-w-0 space-y-5"><legend className="sr-only">Данные компании</legend>
    <div className="grid gap-5 sm:grid-cols-2">{fields.map(([key, label, placeholder, maxLength]) => <div key={key} className="min-w-0"><label htmlFor={`company-${key}`} className="mb-2 block text-sm font-medium">{label}</label><input id={`company-${key}`} name={`company-${key}`} className="field" type={key === "email" ? "email" : key === "website" ? "url" : "text"} required={key !== "website"} value={value[key]} onChange={event => onChange(key, event.target.value)} maxLength={maxLength} placeholder={placeholder} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `company-${key}-error` : undefined} autoComplete={key === "name" ? "organization" : key === "city" ? "address-level2" : key === "email" ? "email" : key === "website" ? "url" : "off"} />{errors[key] && <p id={`company-${key}-error`} className="mt-2 text-xs text-red-800">{errors[key]}</p>}</div>)}</div>
    <div><label htmlFor="company-description" className="mb-2 block text-sm font-medium">О компании и её деятельности</label><textarea id="company-description" name="company-description" className="field" required minLength={30} maxLength={5000} rows={5} value={value.description} onChange={event => onChange("description", event.target.value)} placeholder="Чем занимается компания, какие продукты или услуги предлагает, кто ваши клиенты и как устроена команда?" aria-invalid={Boolean(errors.description)} aria-describedby={`company-description-hint${errors.description ? " company-description-error" : ""}`} /><p id="company-description-hint" className="mt-2 text-xs text-muted">От 30 до 5000 символов. Описание будет видно на странице компании.</p>{errors.description && <p id="company-description-error" className="mt-2 text-xs text-red-800">{errors.description}</p>}</div>
  </fieldset>;
}
