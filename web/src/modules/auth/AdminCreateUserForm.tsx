"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { register } from "@/modules/auth/api";
import { useToastStore } from "@/lib/state/toast-store";

const ROLES = ["admin", "trader", "warehouse", "finance", "compliance"] as const;

export function AdminCreateUserForm(): React.JSX.Element {
  const notify = useToastStore((state) => state.push);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("trader");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      register({
        full_name: fullName,
        email,
        password,
        role
      }),
    onSuccess: () => {
      notify({ type: "success", message: "User account created" });
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("trader");
      setShowPassword(false);
    },
    onError: (error) => {
      notify({ type: "error", message: error instanceof Error ? error.message : "Could not create user" });
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
      <div className="inline">
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
      </div>

      <div className="inline">
        <label>
          Temporary password
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
          Access role
          <select value={role} onChange={(event) => setRole(event.target.value as (typeof ROLES)[number])}>
            {ROLES.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="inline">
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating user..." : "Create user"}
        </button>
      </div>

      <ErrorAlert error={mutation.error} />
    </form>
  );
}
