import type { Metadata } from "next";
import { Suspense } from "react";
import { FavoritesPage } from "@/components/platform/public-pages";
export const metadata: Metadata = { title: "Избранное" };
export default function Page() { return <Suspense fallback={<p role="status" className="p-8">Загрузка…</p>}><FavoritesPage  /></Suspense>; }
