import { portalResponse, portalJson, teacherOnly } from "@/lib/portal-auth";
import { learningReport } from "@/lib/learning-reports";
import { reportRange } from "@/lib/report-range";
export function GET(request: Request) { return portalResponse(request,async user=>{teacherOnly(user);const {from,to}=reportRange(request);return portalJson({success:true,data:await learningReport(user,undefined,from,to)});}); }
