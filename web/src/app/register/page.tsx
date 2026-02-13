import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { RegisterForm } from "@/modules/auth/RegisterForm";

export default function RegisterPage(): React.JSX.Element {
  return (
    <main className="container" style={{ maxWidth: "600px" }}>
      <Card
        title="Create user"
        description="First account bootstrap is open. After bootstrap, only authenticated admins can register additional users."
      >
        <RegisterForm />
        <p>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
