import { examResponse,examJson } from "@/lib/exam-center-service";
// Legacy submissions trusted browser scores and studentId. New attempts are graded server-side.
export function POST(request:Request){return examResponse(request,async()=>examJson({success:false,message:"Vui lòng mở lại Phòng thi thử HSK và dùng lượt thi mới để nộp bài an toàn."},410),true);}
