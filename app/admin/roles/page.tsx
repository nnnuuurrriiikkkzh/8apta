import type { Metadata } from "next";
import { Suspense } from "react";
import { Roles } from "@/components/platform/admin";
export const metadata: Metadata = { title: "Роли и доступ" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Roles  /></Suspense>; }
