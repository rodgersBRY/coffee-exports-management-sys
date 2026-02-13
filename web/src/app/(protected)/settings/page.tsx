"use client";

import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { AdminCreateUserForm } from "@/modules/auth/AdminCreateUserForm";
import { useSessionQuery } from "@/modules/auth/useSessionQuery";

export default function SettingsPage(): React.JSX.Element {
  const session = useSessionQuery();
  const role = session.data?.user?.role;
  const isAdmin = role === "admin";

  return (
    <div className="stack">
      <Card
        title="Settings"
        description="Administrative controls for CEOMS integration and API access governance."
      >
        <div className="stack">
          <div className="alert info">
            Manage API keys and machine-to-machine access in the dedicated security section.
          </div>
          <Link href="/security" className="tag">
            Open Security Configuration
          </Link>
        </div>
      </Card>

      <Card
        title="User Management"
        description="Create platform users and assign roles for operations, warehouse, finance, and compliance."
      >
        {session.isLoading ? <div className="alert info">Loading user permissions...</div> : null}

        {!session.isLoading && !isAdmin ? (
          <div className="alert error">Only admins can create user accounts.</div>
        ) : null}

        {isAdmin ? <AdminCreateUserForm /> : null}
      </Card>
    </div>
  );
}
