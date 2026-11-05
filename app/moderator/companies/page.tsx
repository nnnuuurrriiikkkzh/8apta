import type { Metadata } from "next";
import { Suspense } from "react";
import { CompanyManagement } from "@/components/platform/companies";
export const metadata: Metadata = { title: "Проверка компаний" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><CompanyManagement  /></Suspense>; }
