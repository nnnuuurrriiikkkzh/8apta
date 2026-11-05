import type { Metadata } from "next";
import { Suspense } from "react";
import { Overview } from "@/components/platform/overview";
export const metadata: Metadata = { title: "Администрирование" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Overview area="admin" /></Suspense>; }
