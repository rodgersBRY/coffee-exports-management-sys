import Link from "next/link";

export default function NotFoundPage(): React.JSX.Element {
  return (
    <main className="container">
      <section className="card">
        <h2>Page not found</h2>
        <p>The requested route does not exist.</p>
        <Link href="/">Go back to overview</Link>
      </section>
    </main>
  );
}
