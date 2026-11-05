import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@/components/platform/overview";
export const metadata: Metadata = { title: "Аналитика подбора" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Analytics  /></Suspense>; }
