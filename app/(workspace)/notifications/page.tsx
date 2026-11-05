import type { Metadata } from "next";
import { Suspense } from "react";
import { Notifications } from "@/components/platform/communication";
export const metadata: Metadata = { title: "Уведомления" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Notifications  /></Suspense>; }
