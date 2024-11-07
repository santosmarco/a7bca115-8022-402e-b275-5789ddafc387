// import { configure, tasks } from "@trigger.dev/sdk/v3";
// import { NextResponse } from "next/server";

// import { env } from "~/env";
// import type { checkMeetings } from "~/jobs/check-meetings";

// export async function GET() {
//   configure({
//     baseURL: env.TRIGGER_API_URL,
//     secretKey: env.TRIGGER_SECRET_KEY,
//   });

//   const handle = await tasks.trigger<typeof checkMeetings>(
//     "check-meetings",
//     undefined,
//   );

//   return NextResponse.json(handle);
// }
