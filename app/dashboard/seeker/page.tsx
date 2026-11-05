import type { Metadata } from "next";
import { SeekerOverview } from "@/components/seeker/overview";

export const metadata: Metadata = { title: "Кабинет соискателя" };
export default function SeekerPage() { return <SeekerOverview />; }
