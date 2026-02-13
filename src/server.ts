import { createApp } from "./app/createApp.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`CEOMS API running on http://localhost:${env.port}`);
});
