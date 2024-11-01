"use client";

import "react-notion-x/src/styles.css";
import "~/styles/notion-document.css";

import { NotionRenderer } from "react-notion-x";

import type { RouterOutputs } from "~/trpc/react";

export type ReportPageClientProps = {
  report: RouterOutputs["notion"]["getOne"];
};

export function ReportPageClient({ report }: ReportPageClientProps) {
  return <NotionRenderer darkMode disableHeader fullPage recordMap={report} />;
}
