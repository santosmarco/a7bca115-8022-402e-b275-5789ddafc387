import { z } from "zod";

import { JsonDate } from "./utils";

export const VideoMetadata = z.object({
  key: z.string(),
  value: z.string(),
});
export type VideoMetadata = z.infer<typeof VideoMetadata>;

export const VideoSource = z.object({
  uri: z.string().nullish(),
  type: z.string().nullish(),
});
export type VideoSource = z.infer<typeof VideoSource>;

export const VideoAssets = z.object({
  hls: z.string().url().nullish(),
  iframe: z.string().nullish(),
  player: z.string().url().nullish(),
  thumbnail: z.string().url().nullish(),
  mp4: z.string().url().nullish(),
});
export type VideoAssets = z.infer<typeof VideoAssets>;

export const Video = z.object({
  videoId: z.string(),
  createdAt: JsonDate.nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  publishedAt: JsonDate.nullish(),
  updatedAt: JsonDate.nullish(),
  discardedAt: JsonDate.nullable().nullish(),
  deletesAt: JsonDate.nullable().nullish(),
  discarded: z.boolean().nullish(),
  language: z.string().nullable().nullish(),
  languageOrigin: z.string().nullable().nullish(),
  tags: z.array(z.string()).catch([]),
  metadata: z.array(VideoMetadata).catch([]),
  source: VideoSource.nullish(),
  assets: VideoAssets.nullish(),
  _public: z.boolean().catch(false),
  panoramic: z.boolean().catch(false),
  mp4Support: z.boolean().catch(false),
});
export type Video = z.infer<typeof Video>;
