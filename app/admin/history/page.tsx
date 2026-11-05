import type { Metadata } from "next";
import { Suspense } from "react";
import { History } from "@/components/platform/reports";
export const metadata: Metadata = { title: "Журнал действий" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><History  /></Suspense>; }
