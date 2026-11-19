import { RequireSignIn } from "@/components/auth/require-sign-in";
import { WorkspaceShell } from "@/components/platform/shell";
export default function Layout({ children }: { children: React.ReactNode }) { return <RequireSignIn><WorkspaceShell area="employer">{children}</WorkspaceShell></RequireSignIn>; }
