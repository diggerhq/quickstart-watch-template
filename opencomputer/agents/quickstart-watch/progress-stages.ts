// Shared public copy. Never forward model text or tool output to visitors.
export const progressStages = {
 prerequisites: 'I’m checking which tools, versions, and credentials the guide requires before trying its instructions.',
 installing: 'I’m installing the documented dependencies in an isolated computer to test the setup from scratch.',
 running: 'I’m running the quickstart’s commands and minimal example to see whether they work as documented.',
 comparing: 'I’m comparing the actual results with the guide’s promised output and checking the evidence.',
 reproducing: 'I’m repeating an apparent failure in a clean directory to check whether it is reproducible.',
 signup: 'I’m attempting the product’s free signup with a temporary test account to test its authenticated steps.',
 verification: 'I’m checking the test inbox for the expected verification email so signup can continue.',
 cleanup: 'I’m attempting to remove the test account, credentials, and temporary resources created during this check.',
 reporting: 'I’m putting the observed results, any blockers, and reproducible findings into your report.',
} as const;
