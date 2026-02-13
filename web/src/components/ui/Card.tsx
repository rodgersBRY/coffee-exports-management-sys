import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Card({ title, description, children }: Props): React.JSX.Element {
  return (
    <section className="card">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      <div className="stack">{children}</div>
    </section>
  );
}
