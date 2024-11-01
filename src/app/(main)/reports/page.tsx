import "react-notion/src/styles.css";

import { NotionRenderer } from "react-notion-x";

import { api } from "~/trpc/server";

export default async function ReportsPage() {
  const user = await api.auth.getUser();

  console.log(user);

  const reports = await api.notion.listByClient({ name: "Kanishka Rao" });

  console.log(reports.map((r) => r.properties));

  return (
    <NotionRenderer
      recordMap={reports[0]?.blocks}
      fullPage={true}
      darkMode={false}
    />
  );
}
