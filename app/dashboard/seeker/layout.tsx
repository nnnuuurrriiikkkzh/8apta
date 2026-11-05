import { SeekerShell } from "@/components/seeker/shell";

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return <SeekerShell>{children}</SeekerShell>;
}
