"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

import { useToastStore } from "@/lib/state/toast-store";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/master", label: "Master" },
  { href: "/procurement", label: "Procurement" },
  { href: "/inventory", label: "Inventory" },
  { href: "/contracts", label: "Contracts" },
  { href: "/shipments", label: "Shipments" },
  { href: "/finance", label: "Finance" },
  { href: "/traceability", label: "Traceability" },
  { href: "/security", label: "Security" }
];

type Props = {
  children: ReactNode;
  userEmail?: string;
  userRole?: string;
};

export function AppShell({ children, userEmail, userRole }: Props): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const pushToast = useToastStore((state) => state.push);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      router.replace("/login");
    } catch {
      pushToast({ type: "error", message: "Could not complete logout" });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <h1>CEOMS Web</h1>
          <p>
            {userEmail ?? "unknown user"} <span className="tag">{userRole ?? "n/a"}</span>
          </p>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="secondary" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </header>

      <main className="container">{children}</main>
    </div>
  );
}
