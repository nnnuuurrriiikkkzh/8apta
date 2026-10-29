import type { Metadata } from "next";
import { Header, Footer } from "@/components/site";
import { FavoritesProvider } from "@/components/favorites";
import "./globals.css";
export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: { default: "JobHub — работа, которая подходит тебе", template: "%s · JobHub" },
  description: "Вакансии в IT, дизайне, маркетинге и других направлениях. Демонстрационный интерфейс JobHub.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body className="min-h-screen antialiased"><FavoritesProvider><a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-lime focus:p-3">Перейти к содержимому</a><Header />{children}<Footer /></FavoritesProvider></body></html>;
}
