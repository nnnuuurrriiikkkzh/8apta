"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isDemoSignedIn, useDemoSession } from "./demo-session";

// This gates the local demo UI, not server access. Check again at action time
// so an open form cannot submit after the user signs out in another tab.
export function useRequireSignIn() {
  const router = useRouter();
  return useCallback(() => {
    if (isDemoSignedIn()) return true;
    router.push("/login");
    return false;
  }, [router]);
}

export function RequireSignIn({ children }: { children: ReactNode }) {
  const { ready, signedIn } = useDemoSession();
  const router = useRouter();
  useEffect(() => {
    if (ready && !signedIn) router.replace("/login");
  }, [ready, signedIn, router]);
  if (!ready || !signedIn) return <main id="main" className="shell py-12" role="status">{ready ? "Переходим на страницу входа…" : "Проверяем вход…"}</main>;
  return children;
}
