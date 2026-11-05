import type { Metadata } from "next";
import { Suspense } from "react";
import { Messages } from "@/components/platform/communication";
export const metadata: Metadata = { title: "Сообщения" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><Messages  /></Suspense>; }
