import type { Metadata } from "next";
import { Suspense } from "react";
import { Subscriptions } from "@/components/platform/admin";
export const metadata: Metadata = { title: "Тарифы и подписки" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Subscriptions  /></Suspense>; }
