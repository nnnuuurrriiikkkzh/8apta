import type { Metadata } from "next";
import { Suspense } from "react";
import { Contact } from "@/components/platform/public-pages";
export const metadata: Metadata = { title: "Контакты" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Contact  /></Suspense>; }
