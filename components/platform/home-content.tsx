"use client";
import Link from "next/link";
import { visibleJobs } from "@/lib/platform";
import { usePlatform } from "./store";
import { JobCard } from "@/components/job-card";
import { Icon } from "@/components/icon";

export function HomeJobs(){const {data}=usePlatform();return <div className="mt-8 grid gap-4 md:grid-cols-3">{visibleJobs(data).slice(0,3).map(job=><JobCard key={job.id} job={job} compact/>)}</div>;}
export function HomeCategories(){const {data}=usePlatform();const jobs=visibleJobs(data);return <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">{data.categories.map((category,i)=><Link href={`/jobs?category=${encodeURIComponent(category)}`} key={category} className="group min-w-0 rounded-xl border border-line bg-white p-4 transition-colors hover:border-[#bed08e] hover:bg-[#f0f5e7]"><span className="flex size-10 items-center justify-center rounded-xl bg-[#f1f4eb] group-hover:bg-lime"><Icon name={["code","design","globe","chart","people"][i%5]}/></span><h3 className="mt-5 break-words text-sm font-semibold">{category}</h3><p className="mt-2 text-xs text-muted">Вакансий: {jobs.filter(j=>j.category===category).length}</p></Link>)}</div>;}
