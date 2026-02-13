"use client";

import Link from "next/link";

import { ResourcePanel } from "@/components/data/ResourcePanel";
import { Card } from "@/components/ui/Card";
import { AdminCreateUserForm } from "@/modules/auth/AdminCreateUserForm";
import { useSessionQuery } from "@/modules/auth/useSessionQuery";

export default function UsersPage(): React.JSX.Element {
  const session = useSessionQuery();
  const isAdmin = session.data?.user?.role === "admin";

  if (session.isLoading) {
    return (
      <Card title="Users" description="Manage platform user access and roles.">
        <div className="alert info">Loading user permissions...</div>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card title="Users" description="Manage platform user access and roles.">
        <div className="alert error">Only admins can access user management.</div>
      </Card>
    );
  }

  return (
    <div className="stack">
      <Card
        title="Create User"
        description="Add a new user and assign role-based access for operations."
      >
        <AdminCreateUserForm />
      </Card>

      <ResourcePanel
        title="User Directory"
        description="View all user accounts, status, and last login activity."
        listEndpoint="auth/users"
        sortBy="created_at"
        filters={[
          { name: "role", label: "Role" },
          { name: "is_active", label: "Active (true/false)" }
        ]}
      />

      <Card
        title="API Access"
        description="Manage machine-to-machine keys for integrations and automation tools."
      >
        <Link href="/security" className="tag">
          Open API key management
        </Link>
      </Card>
    </div>
  );
}
