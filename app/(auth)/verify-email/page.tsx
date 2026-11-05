import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCompletion } from "@/components/platform/public-pages";
export const metadata: Metadata = { title: "Подтверждение email" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><AuthCompletion  /></Suspense>; }
