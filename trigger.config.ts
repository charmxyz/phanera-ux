import { defineConfig } from "@trigger.dev/sdk";
import { playwright } from "@trigger.dev/build/extensions/playwright";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "",
  dirs: ["./src/trigger"],
  maxDuration: 3600,
  build: {
    external: ["playwright-core"],
    // Installs headless Chromium into the deployed worker image, so each test run
    // gets its own browser inside its own isolated Trigger.dev container.
    // Must match the installed playwright-core version.
    extensions: [playwright({ browsers: ["chromium"], version: "1.64.1" })],
  },
});
