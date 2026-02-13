"use client";

import { useEffect } from "react";

type Props = {
  error: Error;
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props): React.JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container">
      <section className="card">
        <h2>Unexpected frontend error</h2>
        <p>{error.message}</p>
        <button onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
