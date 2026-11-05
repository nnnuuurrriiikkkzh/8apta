import type { Metadata } from "next";
import { Suspense } from "react";
import { CompanyProfile } from "@/components/platform/companies";
export const metadata: Metadata = { title: "Моя компания" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><CompanyProfile  /></Suspense>; }
