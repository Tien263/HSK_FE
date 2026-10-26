import {portalResponse,portalJson} from "@/lib/portal-auth";
import {enrollmentClass,enrollmentInfo} from "@/lib/class-enrollment";
export function GET(request:Request){return portalResponse(request,async()=>portalJson({success:true,classInfo:enrollmentInfo(await enrollmentClass(new URL(request.url).searchParams.get("code")||""))}));}
