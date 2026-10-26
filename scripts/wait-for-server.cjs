const {setTimeout:delay}=require('node:timers/promises');
const base=(process.env.BASE_URL||'http://127.0.0.1:3000').replace(/\/$/,'');
(async()=>{
 const deadline=Date.now()+60000;
 while(Date.now()<deadline){
  try{const response=await fetch(base+'/api/health',{signal:AbortSignal.timeout(2000)});if(response.ok){const data=await response.json();if(data.status==='ok'&&data.database==='connected'){console.log('Server and database ready.');return;}}}catch{}
  await delay(1000);
 }
 throw new Error('Server/database were not ready within 60 seconds.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
