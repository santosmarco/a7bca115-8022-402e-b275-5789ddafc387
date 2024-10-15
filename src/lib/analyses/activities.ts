import type Video from "@api.video/nodejs-client/lib/model/Video";

import { MetadataKey } from "~/lib/api-video/metadata";
import { Activities } from "~/lib/schemas/activity";

export function getActivities(metadata: Video["metadata"]) {
  const activitiesString = (metadata ?? []).find(
    (item) => item.key === MetadataKey.ACTIVITIES,
  )?.value;

  if (!activitiesString) {
    return null;
  }

  return Activities.parse(JSON.parse(activitiesString));
}
