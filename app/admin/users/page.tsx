import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "@/components/platform/admin";
export const metadata: Metadata = { title: "Пользователи" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Users  /></Suspense>; }
