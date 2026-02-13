"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";

import { useToastStore } from "@/lib/state/toast-store";

type NavItem = { href: string; label: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/procurement", label: "Procurement" },
      { href: "/inventory", label: "Inventory" },
      { href: "/contracts", label: "Contracts" },
      { href: "/shipments", label: "Shipments" }
    ]
  },
  {
    title: "Insights",
    items: [
      { href: "/reports", label: "Reports" },
      { href: "/finance", label: "Finance" },
      { href: "/traceability", label: "Traceability" }
    ]
  },
  {
    title: "Administration",
    items: [
      { href: "/master", label: "Master Data" },
      { href: "/settings", label: "Settings" },
      { href: "/security", label: "Security" }
    ]
  }
];

function toTitleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function breadcrumbsForPath(pathname: string): Array<{ href: string; label: string }> {
  if (pathname === "/") {
    return [{ href: "/", label: "Dashboard" }];
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ href: string; label: string }> = [{ href: "/", label: "Dashboard" }];

  let runningPath = "";
  for (const segment of segments) {
    runningPath = `${runningPath}/${segment}`;
    crumbs.push({
      href: runningPath,
      label: toTitleCase(segment)
    });
  }

  return crumbs;
}

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

  const crumbs = useMemo(() => breadcrumbsForPath(pathname), [pathname]);

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
      <div className="shell-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h1>CEOMS</h1>
            <p>Coffee Export Ops</p>
          </div>

          <div className="sidebar-user">
            <span className="tag">{userRole ?? "n/a"}</span>
            <p>{userEmail ?? "unknown user"}</p>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {NAV_GROUPS.map((group) => (
              <details key={group.title} open className="nav-group">
                <summary>{group.title}</summary>
                <div className="nav-links">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href as never} className={active ? "active" : undefined}>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </details>
            ))}
          </nav>
        </aside>

        <section className="workspace">
          <header className="workspace-topbar">
            <nav className="breadcrumbs" aria-label="Breadcrumbs">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <span key={`${crumb.href}-${crumb.label}`} className="crumb">
                    {isLast ? (
                      <strong>{crumb.label}</strong>
                    ) : (
                      <Link href={crumb.href as never}>{crumb.label}</Link>
                    )}
                    {!isLast ? <span className="crumb-sep">/</span> : null}
                  </span>
                );
              })}
            </nav>
            <button className="secondary" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </header>

          <main className="workspace-container">{children}</main>
        </section>
      </div>
    </div>
  );
}
