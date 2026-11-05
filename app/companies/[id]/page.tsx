import { Companies } from "@/components/platform/companies";
import { initialPlatform } from "@/lib/platform";
import { Suspense } from "react";
export const metadata = { title: "Профиль компании" };
export function generateStaticParams() { return initialPlatform.companies.map(c => ({ id: c.id })); }
async function Content({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <Companies id={id} />; }
export default function Page({ params }: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p className="shell py-12">Загрузка компании…</p>}><Content params={params} /></Suspense>; }
