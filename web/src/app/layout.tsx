import type { Metadata } from "next";
import { ReactNode } from "react";

import { AppProviders } from "@/components/layout/AppProviders";
import { clientEnv } from "@/lib/env";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: clientEnv.appName,
  description: "Coffee Export Operations Management frontend"
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
