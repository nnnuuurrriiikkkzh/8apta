import type { Metadata } from "next";
import { Suspense } from "react";
import { Categories } from "@/components/platform/admin";
export const metadata: Metadata = { title: "Категории" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Categories  /></Suspense>; }
