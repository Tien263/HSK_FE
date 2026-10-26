import { prisma } from "@/lib/prisma";
import { classAccess, jsonBody, portalJson, portalResponse, PortalError, teacherOnly, textField } from "@/lib/portal-auth";
import { addDays, expandSchedule, occurs, rulesOverlap, validDate, vietnamToday } from "@/lib/schedule-core";

const include = { exceptions: true, class: { select: { name: true, level: true, teacherId: true } } } as const;
function time(value: unknown) { const text = textField(value, "Giờ học", true, 5); if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) throw new PortalError(400, "Giờ học cần định dạng HH:MM."); return text; }
function date(value: unknown) { const text = textField(value, "Ngày học", true, 10); if (!validDate(text)) throw new PortalError(400, "Ngày học không hợp lệ."); return text; }
function times(body: Record<string,unknown>) { const startTime = time(body.startTime), endTime = time(body.endTime); if (endTime <= startTime) throw new PortalError(400, "Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày."); return { startTime, endTime }; }
export function GET(request: Request) { return portalResponse(request, async user => {
  const params = new URL(request.url).searchParams; const classId = params.get("classId");
  if (classId) await classAccess(user,classId);
  const from = date(params.get("from") || vietnamToday()), to = date(params.get("to") || addDays(from, 6));
  if (to < from || to > addDays(from,41)) throw new PortalError(400,"Chọn khoảng lịch tối đa 42 ngày.");
  const rules = await prisma.classSchedule.findMany({ where: classId ? { classId } : user.role === "STUDENT" ? { class: { students: { some: { studentId: user.id, status: "APPROVED" } } } } : user.role === "ADMIN" ? {} : { class: { teacherId: user.id } }, include, orderBy: { startDate: "asc" } });
  return portalJson({ success: true, from, to, timeZone: "Asia/Ho_Chi_Minh", rules: user.role === "STUDENT" ? [] : rules, items: expandSchedule(rules,from,to) });
}); }
export function POST(request: Request) { return portalResponse(request, async user => {
  teacherOnly(user); const body = await jsonBody(request); const classId = textField(body.classId,"Lớp học",true,150); await classAccess(user,classId,true);
  const startDate = date(body.startDate), endDate = body.endDate ? date(body.endDate) : null;
  if (endDate && endDate < startDate) throw new PortalError(400,"Ngày kết thúc phải từ ngày bắt đầu trở đi.");
  if (!Array.isArray(body.weekdays) || !body.weekdays.length || body.weekdays.length > 7 || body.weekdays.some(value=>!Number.isInteger(value)||Number(value)<1||Number(value)>7)) throw new PortalError(400,"Chọn thứ học trong tuần.");
  const meetUrl = textField(body.meetUrl || "","Link lớp online",false,1000);
  if (meetUrl && !/^https:\/\//i.test(meetUrl)) throw new PortalError(400,"Link lớp online phải bắt đầu bằng https://.");
  const color=String(body.color||"emerald");if(!["emerald","amber","blue","rose","purple"].includes(color))throw new PortalError(400,"Màu lịch không hợp lệ.");
  const data = { color, classId, title:textField(body.title,"Tên buổi học",true,200), startDate, endDate, weekdays:[...new Set(body.weekdays as number[])], ...times(body), room:textField(body.room||"","Phòng học",false,200), meetUrl };
  const teacherId=(await prisma.class.findUniqueOrThrow({where:{id:classId}})).teacherId;
  const item=await prisma.$transaction(async tx=>{await tx.$executeRawUnsafe("SELECT pg_advisory_xact_lock(hashtext($1))", "schedule:"+teacherId);const others=await tx.classSchedule.findMany({where:{class:{teacherId}},include});if(others.some(rule=>rulesOverlap(data,rule)))throw new PortalError(409,"Giáo viên đã có lịch trùng giờ trong khoảng này.");return tx.classSchedule.create({data});});return portalJson({success:true,item},201);
},true); }
export function PATCH(request: Request) { return portalResponse(request, async user => {
  teacherOnly(user); const body = await jsonBody(request); const id=textField(body.id,"Mã lịch",true,150);
  const rule = await prisma.classSchedule.findUnique({where:{id},include}); if(!rule)throw new PortalError(404,"Không tìm thấy lịch học.");await classAccess(user,rule.classId,true);
  const originalDate=date(body.originalDate); if(!occurs(rule,originalDate))throw new PortalError(400,"Ngày gốc không thuộc chuỗi lịch này.");
  if(body.revision!==rule.revision)throw new PortalError(409,"Lịch đã thay đổi. Vui lòng tải lại.");
  const revision=Number(body.exceptionRevision);if(!Number.isSafeInteger(revision)||revision<0)throw new PortalError(400,"Phiên bản lịch không hợp lệ.");
  const data={date:date(body.date||originalDate),...times(body),cancelled:body.cancelled===true,note:textField(body.note||"","Ghi chú đổi lịch",false,1000),revision:revision+1};
  await prisma.$transaction(async tx=>{await tx.$executeRawUnsafe("SELECT pg_advisory_xact_lock(hashtext($1))", "schedule:"+rule.class.teacherId);if(!data.cancelled){const rules=await tx.classSchedule.findMany({where:{class:{teacherId:rule.class.teacherId}},include});if(expandSchedule(rules,data.date,data.date).some(item=>item.id!==id+":"+originalDate&&!item.cancelled&&item.startTime<data.endTime&&data.startTime<item.endTime))throw new PortalError(409,"Buổi đổi lịch trùng với lịch dạy khác.");}const existing=await tx.scheduleException.findUnique({where:{scheduleId_originalDate:{scheduleId:id,originalDate}}});if((existing?.revision||0)!==revision)throw new PortalError(409,"Buổi học đã đổi ở phiên khác. Vui lòng tải lại.");if(existing)await tx.scheduleException.update({where:{id:existing.id},data});else await tx.scheduleException.create({data:{scheduleId:id,originalDate,...data}});});
  return portalJson({success:true});
},true); }
export function DELETE(request: Request) { return portalResponse(request, async user=>{
  teacherOnly(user); const id=new URL(request.url).searchParams.get("id")||"";const rule=await prisma.classSchedule.findUnique({where:{id}});if(!rule)throw new PortalError(404,"Không tìm thấy lịch học.");await classAccess(user,rule.classId,true);
  await prisma.classSchedule.delete({where:{id}});return portalJson({success:true});
},true); }
