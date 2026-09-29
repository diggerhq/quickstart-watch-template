import { bearer, defineConnection, useSecret } from "@opencomputer/agent";
export const agentmail = defineConnection({
  id: "agentmail", origin: "https://api.agentmail.to", methods: ["GET", "POST", "DELETE"], pathPrefix: "/v0/inboxes",
  headers: { Authorization: bearer(useSecret("AGENTMAIL_API_KEY")) },
});
