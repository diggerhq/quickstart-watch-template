import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// mkdir claims slots atomically even when the model calls commands in parallel.
export async function claimCommand(directory:string,limit=6) {
 await mkdir(directory,{recursive:true,mode:0o700});
 for(let slot=1;slot<=limit;slot++){
  try {await mkdir(join(directory,String(slot)));return {allowed:true,remaining:limit-slot};}
  catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;}
 }
 return {allowed:false,remaining:0};
}
