import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getServerSessionUser, hasServerAccessToken } from "@/lib/auth/server-session";

type Props = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: Props): Promise<React.JSX.Element> {
  const hasAccessToken = await hasServerAccessToken();
  if (!hasAccessToken) {
    redirect("/login");
  }

  const user = await getServerSessionUser();

  return (
    <AppShell userEmail={user?.email} userRole={user?.role}>
      {children}
    </AppShell>
  );
}
