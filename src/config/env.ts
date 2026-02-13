import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const env = {
  port,
  databaseUrl,
};
