import { defineTool } from '@opencomputer/agent';
import { getNotificationConfig } from '../notification-config.js';
import { historyInstructions } from '../notifications.js';
export const settings = defineTool({
  name: 'watch_settings',
  description: 'Read the owner-configured target and database history instructions. Call first on every run. Never exposes the report email or secrets.',
  input: {type:'object',properties:{},additionalProperties:false},
  async run() {
    const config = getNotificationConfig();
    return config ? {mode:'monitor',url:config.url,instructions:historyInstructions(config)} : {mode:'demo',url:'',instructions:'Use the URL from the request. Do not query or change the database. No report email is configured.'};
  },
});
