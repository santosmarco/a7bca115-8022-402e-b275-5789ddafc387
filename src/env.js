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
    CRON_SECRET: z.string(),
    // Internal API Key
    INTERNAL_API_KEY: z.string(),
    // Trigger
    TRIGGER_API_URL: z.string(),
    TRIGGER_SECRET_KEY: z.string(),
    // OAuth
    GOOGLE_OAUTH_CLIENT_ID: z.string(),
    GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
    // OpenAI
    OPENAI_API_KEY: z.string(),
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
    CRON_SECRET: process.env.CRON_SECRET,
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    TRIGGER_API_URL: process.env.TRIGGER_API_URL,
    TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
    GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
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
