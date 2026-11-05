import type { Metadata } from "next";
import { Suspense } from "react";
import { Settings } from "@/components/platform/settings";
export const metadata: Metadata = { title: "Настройки платформы" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Settings admin /></Suspense>; }
