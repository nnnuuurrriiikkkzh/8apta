import type { Metadata } from "next";
import { EmployerApplications } from "@/components/employer-applications";

export const metadata: Metadata = { title: "Заявки кандидатов — кабинет работодателя" };

export default function ApplicationsPage() {
  return <main id="main"><EmployerApplications /></main>;
}
