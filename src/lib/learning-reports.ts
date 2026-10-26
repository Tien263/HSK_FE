import "server-only";
import { prisma } from "./prisma";
import { classAccess, PortalError, type PortalUser } from "./portal-auth";

export async function learningReport(user: PortalUser, classId?: string, from?: string, to?: string, options?:{assignmentId?:string;contentType?:string;dateField?:"opened"|"due"}) {
  if (!["TEACHER","ADMIN","STUDENT"].includes(user.role)) throw new PortalError(403,"Không có quyền xem báo cáo.");
  if (classId) await classAccess(user,classId);
  const classes = await prisma.class.findMany({
    where: { ...(classId ? { id: classId } : {}), ...(user.role === "TEACHER" ? { teacherId: user.id } : user.role === "STUDENT" ? { students: { some: { studentId: user.id, status: "APPROVED" } } } : {}) },
    include: {
      students: { where: { status: "APPROVED" }, include: { student: { select: { id: true, name: true, username: true, status: true, avatar: true } } } },
      lessons: { select: { status: true } },
      assignments: { include: {
        targets: true, quizSet: { select: { title: true } },
        attempts: { include: { answers: { include: { question: { select: { id: true, content: true, skill: true } } } } }, orderBy: { startedAt: "desc" } },
      } },
    },
    orderBy: { createdAt: "desc" },
  });
  const settings = await prisma.setting.findUnique({where:{id:"default"}});
  const now = new Date(); const cutoff = new Date(now.getTime()-7*86400000);
  const students: { id:string;classId:string;className:string;name:string;username:string;avatar:string|null;expected:number;completed:number;overdue:number;averageScore:number|null;lastActive:string|null;status:string }[]=[];
  const assignments: { id:string;title:string;classId:string;className:string;dueAt:string;expected:number;submitted:number;waitingGrade:number;averageScore:number|null;status:string }[]=[];
  const classProgress: { id:string;name:string;level:number;enrolled:number;publishedLessons:number;expected:number;completed:number;overdue:number;progress:number|null;averageScore:number|null }[]=[];
  const activities: { id:string;studentName:string;className:string;action:string;target:string;at:string }[]=[];
  const questionStats=new Map<string,{id:string;content:string;skill:string;wrong:number;total:number}>();
  const scores:number[]=[]; const skillStats=new Map<string,{correct:number;total:number}>();
  let pendingStudents=0;
  const validAssignment=(a:{id?:string;mode?:string;status:string;openAt:Date;dueAt:Date})=>(!options?.assignmentId||a.id===options.assignmentId)&&(!options?.contentType||options.contentType==="all"||(options.contentType==="exercises"&&a.mode==="PRACTICE")||(options.contentType==="exams"&&a.mode==="EXAM"))&&!["DRAFT","ARCHIVED"].includes(a.status)&&a.openAt<=now&&(!from||(options?.dateField==="opened"?a.openAt:a.dueAt)>=new Date(from+"T00:00:00+07:00"))&&(!to||(options?.dateField==="opened"?a.openAt:a.dueAt)<=new Date(to+"T23:59:59.999+07:00"));
  for(const classroom of classes){
    const members=classroom.students.filter(member=>user.role!=="STUDENT"||member.studentId===user.id);
    const memberIds=new Set(members.map(member=>member.studentId));
    const rows=new Map(members.map(member=>[member.studentId,{id:member.studentId,classId:classroom.id,className:classroom.name,name:member.student.name,username:member.student.username,avatar:member.student.avatar,expected:0,completed:0,overdue:0,averageScore:null as number|null,lastActive:null as string|null,status:member.student.status,grades:[] as number[]}]));
    const classGrades:number[]=[];
    for(const member of members)activities.push({id:`join:${classroom.id}:${member.studentId}`,studentName:member.student.name,className:classroom.name,action:"Tham gia lớp",target:classroom.name,at:member.joinedAt.toISOString()});
    for(const assignment of classroom.assignments.filter(validAssignment)){
      const targets=assignment.targets.length?assignment.targets.map(item=>item.studentId).filter(id=>memberIds.has(id)):[...memberIds];
      const assignmentGrades:number[]=[];let submitted=0,waitingGrade=0;
      for(const id of targets){const row=rows.get(id)!;row.expected++;
        const attempts=assignment.attempts.filter(attempt=>attempt.studentId===id);
        const done=attempts.filter(attempt=>["SUBMITTED","GRADED","NEEDS_GRADING"].includes(attempt.status));
        if(done.length){row.completed++;submitted++;if(!done.some(item=>item.status==="GRADED"))waitingGrade++;}else if(assignment.dueAt<now)row.overdue++;
        const graded=attempts.filter(attempt=>attempt.status==="GRADED"&&attempt.score!==null&&attempt.maxScore>0);
        if(assignment.scoreRule==="BEST")graded.sort((a,b)=>(b.score!/b.maxScore)-(a.score!/a.maxScore));
        const grade=graded[0];if(grade){const score=Math.round(grade.score!/grade.maxScore*10000)/100;row.grades.push(score);assignmentGrades.push(score);classGrades.push(score);scores.push(score);
          for(const answer of grade.answers){const stat=questionStats.get(answer.questionId)||{id:answer.questionId,content:answer.question.content,skill:answer.question.skill,wrong:0,total:0};stat.total++;if(!answer.isCorrect)stat.wrong++;questionStats.set(answer.questionId,stat);const skill=skillStats.get(answer.question.skill)||{correct:0,total:0};skill.total++;if(answer.isCorrect)skill.correct++;skillStats.set(answer.question.skill,skill);}
        }
        for(const attempt of attempts){const active=(attempt.submittedAt||attempt.startedAt).toISOString();if(!row.lastActive||active>row.lastActive)row.lastActive=active;}
        if(done[0])activities.push({id:`attempt:${done[0].id}`,studentName:row.name,className:classroom.name,action:done[0].status==="GRADED"?"Đã được chấm bài":"Đã nộp bài",target:assignment.title,at:(done[0].submittedAt||done[0].startedAt).toISOString()});
      }
      assignments.push({id:assignment.id,title:assignment.title,classId:classroom.id,className:classroom.name,dueAt:assignment.dueAt.toISOString(),expected:targets.length,submitted,waitingGrade,averageScore:mean(assignmentGrades),status:assignment.status});
    }
    const roster=[...rows.values()];for(const row of roster){row.averageScore=mean(row.grades);const {grades,...publicRow}=row;void grades;students.push(publicRow);}
    const expected=roster.reduce((sum,row)=>sum+row.expected,0),completed=roster.reduce((sum,row)=>sum+row.completed,0);
    classProgress.push({id:classroom.id,name:classroom.name,level:classroom.level,enrolled:members.length,publishedLessons:classroom.lessons.filter(item=>item.status==="PUBLISHED").length,expected,completed,overdue:roster.reduce((sum,row)=>sum+row.overdue,0),progress:expected?Math.round(completed/expected*100):null,averageScore:mean(classGrades)});
  }
  if(user.role!=="STUDENT") pendingStudents=await prisma.classStudent.count({where:{status:"PENDING",class:{...(classId?{id:classId}:{}),...(user.role==="TEACHER"?{teacherId:user.id}:{})}}});
  const expected=students.reduce((sum,row)=>sum+row.expected,0),completed=students.reduce((sum,row)=>sum+row.completed,0);
  const atRiskStudents=students.filter(row=>row.overdue>0||(settings&&row.averageScore!==null&&row.averageScore<settings.atRiskMinScore*10)).map(row=>({...row,reasons:[...(row.overdue?[`Chưa nộp ${row.overdue} bài đã quá hạn`]:[]),...(settings&&row.averageScore!==null&&row.averageScore<settings.atRiskMinScore*10?[`Điểm trung bình dưới ${settings.atRiskMinScore}/10`]:[])]}));
  return {generatedAt:now.toISOString(),summary:{totalClasses:classes.length,totalStudents:new Set(students.map(row=>row.id)).size,pendingStudents,activeAssignments:assignments.filter(item=>["OPEN","SCHEDULED","ACTIVE"].includes(item.status)&&new Date(item.dueAt)>=now).length,expected,completed,completionRate:expected?Math.round(completed/expected*100):null,averageScore:mean(scores),waitingGrade:assignments.reduce((sum,row)=>sum+row.waitingGrade,0),newClassesCount:classes.filter(item=>item.createdAt>=cutoff).length,newStudentsCount:new Set(activities.filter(item=>item.action==="Tham gia lớp"&&new Date(item.at)>=cutoff).map(item=>item.id.split(":").at(-1))).size},classProgress,students,assignments:assignments.sort((a,b)=>a.dueAt.localeCompare(b.dueAt)),atRiskStudents,activities:activities.sort((a,b)=>b.at.localeCompare(a.at)).slice(0,30),questions:[...questionStats.values()].sort((a,b)=>b.wrong-a.wrong).slice(0,15),skills:[...skillStats].map(([skill,value])=>({skill,total:value.total,correct:value.correct,accuracy:Math.round(value.correct/value.total*100)}))};
}
function mean(values:number[]){return values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length*100)/100:null;}
