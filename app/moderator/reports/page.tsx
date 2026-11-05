import type { Metadata } from "next";
import { Suspense } from "react";
import { Reports } from "@/components/platform/reports";
export const metadata: Metadata = { title: "Жалобы" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Reports  /></Suspense>; }
