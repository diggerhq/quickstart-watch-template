import { defineSchedule } from "@opencomputer/agent";

export default defineSchedule({
  id: "daily-quickstart",
  cron: "0 9 * * *",
  timezone: "UTC",
  enabled: ["development", "production"],
  overlap: "skip",
  dispatch: { text: "Run the configured quickstart check now. Read watch_settings first." },
});
