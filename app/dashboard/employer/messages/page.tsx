import { Suspense } from "react";
import { Messages } from "@/components/platform/communication";
export const metadata = { title: "Переписка с кандидатами" };
export default function Page() { return <Suspense fallback={<p>Загрузка…</p>}><Messages companyView /></Suspense>; }
