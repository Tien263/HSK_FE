import { redirect } from "next/navigation";

export default function TeacherLessonsPage() {
  redirect("/t/dashboard?tab=lessons");
}
