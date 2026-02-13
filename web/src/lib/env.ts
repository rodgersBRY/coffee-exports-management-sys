import { z } from "zod";

const serverEnvSchema = z.object({
  CEOMS_API_URL: z.string().url(),
  SESSION_COOKIE_SECURE: z.enum(["true", "false"]).default("false")
});

const parsed = serverEnvSchema.safeParse({
  CEOMS_API_URL: process.env.CEOMS_API_URL,
  SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE ?? "false"
});

if (!parsed.success) {
  throw new Error(`Invalid server environment: ${parsed.error.message}`);
}

export const serverEnv = {
  apiUrl: parsed.data.CEOMS_API_URL.replace(/\/$/, ""),
  secureCookies: parsed.data.SESSION_COOKIE_SECURE === "true"
};

export const clientEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "CEOMS Web"
};
