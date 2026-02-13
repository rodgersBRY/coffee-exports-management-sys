"use client";

import Link from "next/link";

import { Card } from "@/components/ui/Card";

export default function SettingsPage(): React.JSX.Element {
  return (
    <div className="stack">
      <Card
        title="Settings"
        description="Administrative controls for CEOMS integration and API access governance."
      >
        <div className="stack">
          <div className="alert info">
            Manage machine-to-machine API access in the security area.
          </div>
          <Link href="/security" className="tag">
            Open Security Configuration
          </Link>
        </div>
      </Card>

      <Card
        title="User Administration"
        description="Create users and review user accounts from the dedicated Users section."
      >
        <Link href={"/users" as never} className="tag">
          Open User Management
        </Link>
      </Card>
    </div>
  );
}
