"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { companyHref, splitCompanyMentions } from "@/lib/company-links";
import { usePlatform } from "./platform/store";

const linkStyle = "rounded-sm underline decoration-current/35 underline-offset-4 hover:decoration-current [overflow-wrap:anywhere]";

export function CompanyLink({ name, id, children, className = "" }: { name?: string; id?: string; children?: ReactNode; className?: string }) {
  const { data } = usePlatform();
  const company = data.companies.find(item => id ? item.id === id : item.name.toLocaleLowerCase("ru") === name?.trim().toLocaleLowerCase("ru"));
  const content = children ?? name ?? company?.name;
  return company
    ? <Link href={companyHref(company.id)} className={`${linkStyle} ${className}`}>{content}</Link>
    : <span className={className}>{content}</span>;
}

// Use only in text containers, never inside another link, button or form control.
export function CompanyText({ text }: { text: string }) {
  const { data } = usePlatform();
  return <>{splitCompanyMentions(text, data.companies).map((part, index) => part.companyId
    ? <Link key={index} href={companyHref(part.companyId)} className={linkStyle}>{part.text}</Link>
    : <Fragment key={index}>{part.text}</Fragment>)}</>;
}
