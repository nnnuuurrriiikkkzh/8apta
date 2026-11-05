import { Suspense } from "react";
import { jobs } from "@/lib/jobs";
import { JobDetail } from "@/components/platform/job-detail";
export const metadata = { title: "Вакансия" };
export function generateStaticParams() { return jobs.map(j => ({ id: j.id })); }
async function Content({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <JobDetail id={id} />; }
export default function Page({ params }: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p className="shell py-12">Загрузка вакансии…</p>}><Content params={params} /></Suspense>; }
