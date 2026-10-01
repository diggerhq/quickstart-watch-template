type Exec = (file:string,args:string[],options:{timeout:number;maxBuffer:number}) => Promise<{stdout:string}>;

// Runtime images may supply Chromium through PATH without Debian's apt-get.
export async function prepareBrowser(root:string, exec:Exec):Promise<string|undefined> {
 const found = await exec('sh',['-c','command -v chromium || command -v chromium-browser || command -v google-chrome || true'],{timeout:5000,maxBuffer:10000});
 const executable = found.stdout.trim().split('\n')[0];
 if(executable)return executable;
 // Install only the browser. OS package installation is the runtime owner's job.
 await exec(process.execPath,[`${root}/node_modules/playwright/cli.js`,'install','chromium'],{timeout:120000,maxBuffer:1000000});
 return undefined;
}

export const browserBlocker = {
 blocked:true,
 category:'runner',
 reason:'The isolated runtime could not prepare or launch Chromium. The required browser flow was not tested.',
 nextAction:'Do not retry browser installation or attempt signup through another tool. Clean up any test resources, then call finish_report with verdict blocked and the observed limitation.',
} as const;
