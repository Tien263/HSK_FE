import { portalResponse, portalJson, PortalError } from "@/lib/portal-auth";
import { learningReport } from "@/lib/learning-reports";
import { reportRange } from "@/lib/report-range";
export function GET(request: Request){return portalResponse(request,async user=>{if(user.role!=="STUDENT")throw new PortalError(403,"Báo cáo này dành cho học sinh.");const classId=new URL(request.url).searchParams.get("classId")||undefined;const {from,to}=reportRange(request);return portalJson({success:true,data:await learningReport(user,classId,from,to)});});}
