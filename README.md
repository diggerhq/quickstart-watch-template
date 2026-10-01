# Quickstart Watch

[Deploy to OpenComputer](https://app.opencomputer.dev/template?repository-url=https%3A%2F%2Fgithub.com%2Fdiggerhq%2Fquickstart-watch-template)

An agent follows your public quickstart in an isolated computer. It runs once after deployment, then daily at 09:00 UTC. AgentMail emails the first report, then new issues or blockers. Reports may land in spam.

In OpenComputer, enter your public quickstart URL (`WATCH_URL`), report email (`WATCH_EMAIL`), and managed `AGENTMAIL_API_KEY`. Optionally set `WATCH_SENDER_INBOX` to an existing AgentMail inbox if your account is at its inbox limit. Secrets stay in OpenComputer. Usage is billed to your accounts.

Native imports deploy to Development, where the daily schedule is enabled. The schedule also supports Production: disable one environment's schedule if you promote and use both. Archive the project to stop future checks.

Reports live in OpenComputer sessions; fingerprints and email outcomes live in its project database. Cross-run email deduplication is best-effort because the agent reads and writes history. Interrupted or concurrent runs can produce duplicates or missed notifications. Sending retries up to three times in the run; there is no background email queue. Provider acceptance does not guarantee inbox receipt.

Checks can be blocked by CAPTCHA, payment, SSO, manual approval, or runner limits. Nothing submits feedback to the target website. Credentials and personal data are redacted on a best-effort basis. The agent may create one free test account and attempts cleanup afterward.

Try the demo at [axfeedback.dev](https://axfeedback.dev).

## Validate the template

Run `npm install`, `npm test`, and `npm run validate`. The compiled-template test verifies that AgentMail is selected in the runtime, its authorization uses the managed secret, required owner settings are included, and the first run and daily schedule target the installed agent.

If an installation was created before the AgentMail runtime fix, import the updated template into a new project or redeploy the updated agent to the existing project. A new run of an old deployment does not pick up repository changes. For native installs, check `WATCH_URL`, `WATCH_EMAIL`, and the managed `AGENTMAIL_API_KEY` in Development. `WATCH_SENDER_INBOX` is optional and must be an existing inbox ID/address if supplied. Archive the old project if replacing it so its daily schedule does not continue running.
