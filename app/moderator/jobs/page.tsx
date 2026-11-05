import type { Metadata } from "next";
import { Suspense } from "react";
import { JobManagement } from "@/components/platform/job-management";
export const metadata: Metadata = { title: "Проверка вакансий" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><JobManagement mode="moderator" /></Suspense>; }
