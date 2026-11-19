import { Suspense } from "react";
import { Support } from "@/components/platform/support";
export const metadata = { title: "Служба поддержки" };
export default function Page() { return <Suspense fallback={<p role="status">Загрузка обращений…</p>}><Support/></Suspense>; }
