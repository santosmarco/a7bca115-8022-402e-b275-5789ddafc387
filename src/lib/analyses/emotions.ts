import type Video from "@api.video/nodejs-client/lib/model/Video";

import { MetadataKey } from "~/lib/api-video/metadata";
import { EmotionAnalysis } from "~/lib/schemas/emotion";

export function getEmotionAnalysis(metadata: Video["metadata"]) {
  const emotionAnalysisString = (metadata ?? []).find(
    (item) => item.key === MetadataKey.EMOTIONS,
  )?.value;

  if (!emotionAnalysisString) {
    return null;
  }

  return EmotionAnalysis.parse(JSON.parse(emotionAnalysisString));
}
