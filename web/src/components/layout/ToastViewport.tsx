"use client";

import { useEffect } from "react";

import { useToastStore } from "@/lib/state/toast-store";

export function ToastViewport(): React.JSX.Element {
  const { toasts, dismiss } = useToastStore();

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismiss(toast.id), 4500)
    );

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [dismiss, toasts]);

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast alert ${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
