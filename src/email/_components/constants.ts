import { env } from "~/env";

export const BASE_URL = env.NEXT_PUBLIC_SITE_URL;
if (!BASE_URL) throw new Error("NEXT_PUBLIC_SITE_URL is not defined");

export const COMPANY_NAME = "Titan GameTape";
