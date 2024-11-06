import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Node.js
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // Vercel
    VERCEL_URL: z.string().optional(),
    SITE_URL: z.string().optional(),
    // API Video
    API_VIDEO_API_KEY: z.string(),
    // Meeting Baas
    MEETING_BAAS_API_KEY: z.string(),
    // Notion
    NOTION_INTEGRATION_SECRET: z.string(),
    NOTION_REPORTS_DATABASE_ID: z.string(),
  },

  client: {
    // Vercel
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },

  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    SITE_URL: process.env.SITE_URL,
    API_VIDEO_API_KEY: process.env.API_VIDEO_API_KEY,
    NOTION_INTEGRATION_SECRET: process.env.NOTION_INTEGRATION_SECRET,
    NOTION_REPORTS_DATABASE_ID: process.env.NOTION_REPORTS_DATABASE_ID,
    MEETING_BAAS_API_KEY: process.env.MEETING_BAAS_API_KEY,

    // Client
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
