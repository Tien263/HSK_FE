import { redirect } from "next/navigation";

export default function TeacherClassesPage() {
  redirect("/t/dashboard?tab=classes");
}
