import { prisma } from "@/lib/prisma";
import { getDictionaryUser } from "@/lib/dictionary-session";
export interface AuthUser { id:string;username:string;name:string;email:string|null;role:string;status:string;avatar:string|null; }
export async function getAuthUser(request: Request): Promise<AuthUser|null> {
  const session = await getDictionaryUser(request);
  if (!session) return null;
  return prisma.user.findFirst({where:{id:session.id,status:"ACTIVE"},select:{id:true,username:true,name:true,email:true,role:true,status:true,avatar:true}});
}
