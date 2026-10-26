import {prisma} from "./prisma";
import {PortalError} from "./portal-auth";
import {decodeClassDescription} from "./class-helper";
export async function enrollmentClass(code:string,id?:string){
 const normalized=code.trim().replace(/\s/g,"");if(!id&&(!normalized||normalized.length<6||normalized.length>100))throw new PortalError(400,"Mã lớp cần ít nhất 6 ký tự.");
 const rows=await prisma.class.findMany({where:{isActive:true,...(id?{id}:{OR:[{id:normalized},{id:{endsWith:normalized.toLowerCase()}},{id:{endsWith:normalized.toUpperCase()}}]})},include:{teacher:{select:{name:true,avatar:true}},_count:{select:{students:{where:{status:"APPROVED"}}}}}});
 const available=rows.filter(row=>!decodeClassDescription(row.description,row.createdAt,row.isActive,row.level).isArchived);if(available.length!==1)throw new PortalError(404,"Không tìm thấy lớp đang mở với mã này. Vui lòng kiểm tra lại.");return available[0];
}
export function enrollmentInfo(row:Awaited<ReturnType<typeof enrollmentClass>>){const metadata=decodeClassDescription(row.description,row.createdAt,row.isActive,row.level);return{id:row.id,name:row.name,level:row.level,description:metadata.text,track:metadata.track,code:row.id.slice(-6).toUpperCase(),teacherName:row.teacher.name,teacherAvatar:row.teacher.avatar,studentCount:row._count.students};}
