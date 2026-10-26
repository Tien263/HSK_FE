import {portalResponse,portalJson,jsonBody} from "@/lib/portal-auth";
import {submitAttempt} from "@/lib/submit-attempt";
export function POST(request:Request,{params}:{params:Promise<{id:string}>}){return portalResponse(request,async user=>{const {id}=await params;const body=await jsonBody(request);return portalJson(await submitAttempt(user,id,body.answers));},true);}
