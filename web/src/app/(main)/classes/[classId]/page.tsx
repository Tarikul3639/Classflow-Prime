import { redirect } from "next/navigation";

export default function ClassPage({
  params,
}: {
  params: { classId: string };
}) {
  redirect(`/classes/${params.classId}/updates`);
}