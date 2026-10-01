import { defineTool, type DataValue } from '@opencomputer/agent';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { claimCommand } from '../command-budget.js';
const exec=promisify(execFile);

export const command = defineTool({
 name:'run_quickstart_command',
 description:'Run a shell command in the isolated computer. Batch related commands. Six test commands and two cleanup commands are allowed per session; save a report when the budget is exhausted.',
 input:{type:'object',properties:{command:{type:'string',maxLength:10000},purpose:{type:'string',enum:['test','cleanup']}},required:['command','purpose'],additionalProperties:false},
 async run({input,sessionId,reportProgress,signal}):Promise<DataValue> {
  const cleanup=input.purpose==='cleanup';
  const budget=await claimCommand(`/workspace/.quickstart-budget/${sessionId.replace(/[^a-zA-Z0-9-]/g,'')}/${cleanup?'cleanup':'test'}`,cleanup?2:6);
  if(!budget.allowed)return {blocked:true,reason:'The command budget for this check has been reached.',nextAction:'Do not call this tool again for this purpose. Clean up any test resources, then call finish_report with the evidence collected so far.'};
  await reportProgress({phase:cleanup?'cleanup':'running',message:cleanup?'Cleaning up test resources':'Running the documented quickstart commands'});
  let exitCode:number|string=0,stdout='',stderr='';
  try {const result=await exec('sh',['-lc',String(input.command)],{cwd:'/workspace',timeout:90000,maxBuffer:100000,signal});stdout=result.stdout;stderr=result.stderr;}
  catch(error){const e=error as {code?:number|string;stdout?:string;stderr?:string};exitCode=e.code??'interrupted';stdout=e.stdout??'';stderr=e.stderr??'';}
  return {exitCode,stdout:stdout.slice(-3000),stderr:stderr.slice(-1000),remainingCommands:budget.remaining,nextAction:budget.remaining===0?'No commands remain for this purpose. Clean up if needed and call finish_report now.':'Continue within the remaining command budget; save a partial blocked report if required credentials or infrastructure are missing.'};
 },
});
