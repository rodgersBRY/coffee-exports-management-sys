import { ApiClientError } from "@/lib/errors/api-client-error";

type Props = {
  error: unknown;
};

export function ErrorAlert({ error }: Props): React.JSX.Element | null {
  if (!error) {
    return null;
  }

  const message =
    error instanceof ApiClientError
      ? `${error.message}${error.requestId ? ` (request: ${error.requestId})` : ""}`
      : error instanceof Error
        ? error.message
        : "Unexpected error";

  return <div className="alert error">{message}</div>;
}
