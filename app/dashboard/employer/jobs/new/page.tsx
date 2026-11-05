import type { Metadata } from "next";
import { Suspense } from "react";
import { JobEditor } from "@/components/platform/job-editor";
export const metadata: Metadata = { title: "Новая вакансия" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><JobEditor  /></Suspense>; }
