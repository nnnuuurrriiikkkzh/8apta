import { WorkspaceShell } from "@/components/platform/shell";
export default function Layout({ children }: { children: React.ReactNode }) { return <WorkspaceShell area="admin">{children}</WorkspaceShell>; }
