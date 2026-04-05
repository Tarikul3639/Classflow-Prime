import { redirect } from "next/navigation";

export default async function ClassPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  redirect(`/classes/${classId}/updates`);
}