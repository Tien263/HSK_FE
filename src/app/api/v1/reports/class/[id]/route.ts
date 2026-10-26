import {classicReport} from "@/lib/classic-report";
import { portalResponse, portalJson, teacherOnly } from "@/lib/portal-auth";
import { learningReport } from "@/lib/learning-reports";
import { reportRange } from "@/lib/report-range";
export function GET(request: Request,{params}:{params:Promise<{id:string}>}) { return portalResponse(request,async user=>{teacherOnly(user);const {id}=await params;const query=new URL(request.url).searchParams;if(query.get("classic")==="1")return portalJson({success:true,...await classicReport(user,id==="all"?undefined:id,query)});const {from,to}=reportRange(request);return portalJson({success:true,data:await learningReport(user,id,from,to)});}); }
