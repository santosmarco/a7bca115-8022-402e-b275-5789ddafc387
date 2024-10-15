import type Video from "@api.video/nodejs-client/lib/model/Video";
import _ from "lodash";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getActivities } from "~/lib/analyses/activities";
import { getEmotionAnalysis } from "~/lib/analyses/emotions";
import { getSummary } from "~/lib/analyses/summary";
import { isTruthy } from "~/lib/utils";
import { JumpToMomentButton } from "./jump-to-moment";
import { SegmentsController } from "./segments-controller";

export type VideoDetailsProps = Pick<
  Video,
  "title" | "publishedAt" | "metadata"
>;

const TabKey = {
  SUMMARY: "summary",
  EMOTIONS: "emotions",
  DELEGATION: "delegation",
  DECISION_MAKING: "decision-making",
  FEEDBACK: "feedback",
} as const;
type TabKey = (typeof TabKey)[keyof typeof TabKey];

export function VideoDetails({
  title,
  publishedAt,
  metadata,
}: VideoDetailsProps) {
  const summary = getSummary(metadata);
  const emotions = getEmotionAnalysis(metadata);
  const activities = getActivities(metadata);
  const activitiesByType = _.groupBy(
    activities,
    (activity) => activity.activity,
  );

  const tabKeys = [
    summary && { key: TabKey.SUMMARY, label: "Summary" },
    emotions && { key: TabKey.EMOTIONS, label: "Emotions" },
    (activitiesByType.Delegation ?? []).length > 0 && {
      key: TabKey.DELEGATION,
      label: "Delegation",
    },
    (activitiesByType["Decision Making"] ?? []).length > 0 && {
      key: TabKey.DECISION_MAKING,
      label: "Decision Making",
    },
    (activitiesByType.Feedback ?? []).length > 0 && {
      key: TabKey.FEEDBACK,
      label: "Feedback",
    },
  ].filter(isTruthy);

  const segments =
    activities?.map((activity, i) => ({
      start: activity.segment_start_timestamp_in_seconds,
      end: activity.segment_end_timestamp_in_seconds,
      color: `chart-${(i % 5) + 1}`,
    })) ?? [];

  return (
    <>
      <SegmentsController segments={segments} />
      <Card className="overflow-hidden">
        <CardHeader className="bg-secondary">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {publishedAt && (
            <CardDescription className="flex items-center space-x-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(publishedAt).toLocaleDateString()}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue={TabKey.SUMMARY} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-secondary p-0">
              {tabKeys.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="rounded-none rounded-t border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={TabKey.SUMMARY}>
              <p className="-mt-2 p-4 text-sm leading-relaxed">{summary}</p>
            </TabsContent>
            <TabsContent value={TabKey.EMOTIONS}>
              <ScrollArea className="-mt-2 h-[400px]">
                {emotions?.emotion_sequences.map((emotion) => (
                  <div
                    key={emotion.sequence_id}
                    className="m-4 rounded-lg bg-secondary p-4 [&:last-child]:mb-8"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">
                        {emotion.speaker_name}
                      </span>
                      <Badge
                        variant="outline"
                        className="cursor-default bg-background"
                      >
                        {emotion.emotion}
                      </Badge>
                    </div>
                    <p className="text-sm">{emotion.reasoning}</p>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
            {Object.entries(activitiesByType).map(([type, activities]) => (
              <TabsContent
                key={type}
                value={type.toLowerCase().replace(" ", "-")}
              >
                <ScrollArea className="-mt-2 h-[400px]">
                  {activities.map((activity) => (
                    <div
                      key={activity.sequence_id}
                      className="m-4 rounded-lg bg-secondary p-4 [&:last-child]:mb-8"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold leading-none">
                          {activity.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <ClockIcon className="-mt-[1px] h-3 w-3" />
                          <span className="leading-none">
                            {activity.segment_start_timestamp}
                          </span>
                        </Badge>
                      </div>
                      <p className="mb-4 text-sm">{activity.summary}</p>
                      <JumpToMomentButton
                        timestamp={activity.segment_start_timestamp_in_seconds}
                      />
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
