import type Video from "@api.video/nodejs-client/lib/model/Video";

import { MetadataKey } from "~/lib/api-video/metadata";

export function getSummary(metadata: Video["metadata"]) {
  const summaryString = (metadata ?? []).find(
    (item) => item.key === MetadataKey.SUMMARY,
  )?.value;

  if (!summaryString) {
    return null;
  }

  return summaryString;
}
