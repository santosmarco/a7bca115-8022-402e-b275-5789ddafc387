"use client";

import { ExpandingText } from "~/components/expanding-text";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export type MeetingSummaryProps = {
  summary: string;
};

export function MeetingSummary({ summary }: MeetingSummaryProps) {
  return (
    <Card className="rounded-none border-y-0 border-l-2 border-r-0 lg:rounded-md lg:border lg:border-accent">
      <CardHeader className="px-4 py-1 pb-2 lg:p-6">
        <CardTitle>Meeting Summary</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-1 lg:p-6 lg:pt-0">
        <div className="block lg:hidden">
          <ExpandingText text={summary} />
        </div>
        <div className="hidden lg:block">{summary}</div>
      </CardContent>
    </Card>
  );
}
