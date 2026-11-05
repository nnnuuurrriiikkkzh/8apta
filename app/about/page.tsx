import type { Metadata } from "next";
import { Suspense } from "react";
import { About } from "@/components/platform/public-pages";
export const metadata: Metadata = { title: "О проекте" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><About  /></Suspense>; }
