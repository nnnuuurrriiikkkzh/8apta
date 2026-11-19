import { Suspense } from "react";
import { Support } from "@/components/platform/support";
export const metadata = { title: "Обращения в поддержку" };
export default function Page() { return <Suspense fallback={<p role="status">Загрузка обращений…</p>}><Support admin/></Suspense>; }
