import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Node.js
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // API Video
    API_VIDEO_API_KEY: z.string(),
    // Notion
    NOTION_INTEGRATION_SECRET: z.string(),
    NOTION_REPORTS_DATABASE_ID: z.string(),
  },

  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    API_VIDEO_API_KEY: process.env.API_VIDEO_API_KEY,
    NOTION_INTEGRATION_SECRET: process.env.NOTION_INTEGRATION_SECRET,
    NOTION_REPORTS_DATABASE_ID: process.env.NOTION_REPORTS_DATABASE_ID,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
