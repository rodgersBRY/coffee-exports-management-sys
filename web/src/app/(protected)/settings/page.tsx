"use client";

import Link from "next/link";

import { Card } from "@/components/ui/Card";

export default function SettingsPage(): React.JSX.Element {
  return (
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
  );
}
