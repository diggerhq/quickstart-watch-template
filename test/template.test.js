import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTemplateProject} from '../node_modules/@opencomputer/cli/dist/template.js';

test('native installation packages AgentMail, owner settings, first run, database and daily schedule', async () => {
 const bundle = await buildTemplateProject(process.cwd());
 const artifact = bundle.artifacts.find(a => a.localAgentId === 'quickstart-watch');
 assert.ok(artifact);
 const files = JSON.parse(artifact.body).files;
 const reactive = JSON.parse(Buffer.from(files.find(f => f.path === '.opencomputer/reactive.json').content, 'base64').toString());
 assert.ok(reactive.connections.includes('agentmail'), 'runtime must select the AgentMail connection');
 assert.ok(reactive.tools.includes('report_stage'));
 assert.ok(reactive.tools.includes('run_quickstart_command'));
 assert.ok(!reactive.tools.includes('sandbox_exec'));
 const connection = artifact.httpConnections.find(c => c.id === 'agentmail');
 assert.ok(connection);
 assert.equal(connection.origin, 'https://api.agentmail.to');
 assert.equal(connection.pathPrefix, '/v0/inboxes');
 assert.deepEqual(connection.headers.Authorization, {kind:'secret', name:'AGENTMAIL_API_KEY', prefix:'Bearer '});
 const secret = bundle.requirements.secrets.find(s => s.name === 'AGENTMAIL_API_KEY');
 assert.ok(secret?.required);
 assert.equal(secret.localAgentId, 'quickstart-watch');
 assert.deepEqual(secret.allowedOrigins, ['https://api.agentmail.to']);
 for (const name of ['WATCH_URL','WATCH_EMAIL']) {
  const setting = bundle.requirements.runtimeVariables.find(v => v.name === name);
  assert.ok(setting?.required);
  assert.equal(setting.example, undefined);
 }
 assert.equal(bundle.requirements.runtimeVariables.find(v => v.name === 'WATCH_SENDER_INBOX')?.required, false);
 assert.equal(bundle.template.firstRun.agent, 'quickstart-watch');
 assert.match(JSON.stringify(bundle.resources), /watch_reports/);
 const schedule = bundle.resources.schedules.find(s => s.id === 'daily-quickstart');
 assert.ok(schedule);
 assert.deepEqual(schedule.enabled, ['development','production']);
 assert.equal(schedule.cron, '0 9 * * *');
 assert.equal(schedule.timezone, 'UTC');
});
