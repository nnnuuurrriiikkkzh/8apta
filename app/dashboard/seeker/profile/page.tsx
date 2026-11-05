import type { Metadata } from "next";
import { ProfilePage } from "@/components/seeker/profile";

export const metadata: Metadata = { title: "Мой профиль" };
export default function Profile() { return <ProfilePage />; }
