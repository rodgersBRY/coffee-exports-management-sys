import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/modules/auth/LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="container" style={{ maxWidth: "540px" }}>
      <Card
        title="Sign in to CEOMS"
        description="Use your operations credentials to access procurement, inventory, contracts, shipments, and finance workflows."
      >
        <LoginForm />
        <p>
          Need an account? <Link href="/register">Create one</Link>
        </p>
      </Card>
    </main>
  );
}
