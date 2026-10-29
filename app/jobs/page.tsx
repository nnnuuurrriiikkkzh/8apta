import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
export const metadata: Metadata = { title: "Каталог вакансий" };
export default function JobsPage() { return <main id="main"><Suspense fallback={<div className="shell min-h-[70vh] py-16" role="status">Загружаем вакансии…</div>}><Catalog /></Suspense></main>; }
