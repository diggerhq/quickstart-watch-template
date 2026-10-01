import { defineTool } from '@opencomputer/agent';
import { progressStages } from '../progress-stages.js';

export const reportStage = defineTool({
 name: 'report_stage',
 description: 'Announce the next actual stage of work with plain-language public progress. Call before starting a new stage.',
 input: {type:'object',properties:{stage:{type:'string',enum:Object.keys(progressStages)}},required:['stage'],additionalProperties:false},
 async run({input}) {
  const stage = String(input.stage);
  if (!Object.hasOwn(progressStages, stage)) throw new Error('Unknown progress stage.');
  return {message:progressStages[stage as keyof typeof progressStages]};
 },
});
