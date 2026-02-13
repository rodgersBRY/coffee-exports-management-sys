"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { register } from "@/modules/auth/api";

const ROLES = ["admin", "trader", "warehouse", "finance", "compliance"] as const;

export function RegisterForm(): React.JSX.Element {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("trader");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      register({
        email,
        password,
        full_name: fullName,
        role
      }),
    onSuccess: () => {
      router.replace("/login");
    }
  });

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <label>
        Full name
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label>
        Password (min 12 chars)
        <div className="field-with-action">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={12}
          />
          <button
            type="button"
            className="ghost"
            onClick={() => setShowPassword((previous) => !previous)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      <label>
        Role
        <select value={role} onChange={(event) => setRole(event.target.value as (typeof ROLES)[number])}>
          {ROLES.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating account..." : "Create account"}
      </button>
      <ErrorAlert error={mutation.error} />
    </form>
  );
}
