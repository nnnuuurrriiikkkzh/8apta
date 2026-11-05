import type { Metadata } from "next";
import { Suspense } from "react";
import { Applications } from "@/components/platform/applications";
export const metadata: Metadata = { title: "Отклики кандидатов" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Applications employer /></Suspense>; }
