import type { Metadata } from "next";
import { ResumesPage } from "@/components/seeker/resumes";

export const metadata: Metadata = { title: "Мои резюме" };
export default function Resumes() { return <ResumesPage />; }
