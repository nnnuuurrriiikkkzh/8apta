import { RequireSignIn } from "@/components/auth/require-sign-in";
import { SeekerShell } from "@/components/seeker/shell";

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return <RequireSignIn><SeekerShell>{children}</SeekerShell></RequireSignIn>;
}
