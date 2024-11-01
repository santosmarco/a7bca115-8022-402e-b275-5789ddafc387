import { api } from "~/trpc/server";

import { ReportPageClient } from "./page.client";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await api.notion.getOne({ reportId });

  console.log(report.blocks);

  return <ReportPageClient report={report} />;
}
