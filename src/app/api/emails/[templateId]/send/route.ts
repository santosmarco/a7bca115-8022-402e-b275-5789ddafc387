import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeParseAsync } from "zod-error";

import { sendExploreUnlockedEmail } from "~/lib/email";
import { logger } from "~/lib/logging/server";
import {
  createClient as createSupabaseClient,
  type SupabaseServerClient,
} from "~/lib/supabase/server";

const RequestBody = z.discriminatedUnion("templateId", [
  z.object({
    templateId: z.literal("explore-unlocked"),
    variables: z.object({
      profile_id: z.string().min(1, "Required").uuid("Invalid profile ID"),
    }),
  }),
]);
type RequestBody = z.infer<typeof RequestBody>;

type ResponseBody =
  | { success: true; messageId: string }
  | { success: false; error: string };

function createErrorResponse(
  error: string,
  status: number,
): NextResponse<ResponseBody> {
  return NextResponse.json({ success: false, error }, { status });
}

function createSuccessResponse(messageId: string): NextResponse<ResponseBody> {
  return NextResponse.json({ success: true, messageId }, { status: 200 });
}

async function handleExploreUnlockedEmail(
  supabase: SupabaseServerClient,
  profileId: string,
): Promise<NextResponse<ResponseBody>> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (profileError) {
    logger.error("Failed to fetch profile", { error: profileError, profileId });
    return createErrorResponse(profileError.message, 404);
  }

  if (!profile) {
    logger.error("Profile not found", { profileId });
    return createErrorResponse("Profile not found", 404);
  }

  const { data: emailData, error: emailError } = await sendExploreUnlockedEmail(
    {
      profile,
    },
  );

  if (emailError) {
    logger.error("Failed to send explore unlocked email", {
      error: emailError,
      profileId,
    });
    return createErrorResponse(emailError.message, 500);
  }

  if (!emailData) {
    logger.error("Email data missing after send", { profileId });
    return createErrorResponse("Email not sent", 500);
  }

  logger.info("Successfully sent explore unlocked email", {
    profileId,
    messageId: emailData.id,
  });
  return createSuccessResponse(emailData.id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { templateId: string } },
): Promise<NextResponse<ResponseBody>> {
  try {
    const requestBodyParseResult = await safeParseAsync(RequestBody, {
      templateId: params.templateId,
      ...(await request.json()),
    });

    if (!requestBodyParseResult.success) {
      logger.warn("Invalid request body", {
        error: requestBodyParseResult.error,
      });
      return createErrorResponse(requestBodyParseResult.error.message, 400);
    }

    const { data: parsedBody } = requestBodyParseResult;
    const supabase = await createSupabaseClient();

    if (parsedBody.templateId === "explore-unlocked") {
      return handleExploreUnlockedEmail(
        supabase,
        parsedBody.variables.profile_id,
      );
    }

    logger.warn("Invalid template ID received", {
      templateId: params.templateId,
    });
    return createErrorResponse("Invalid template ID", 400);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Unexpected error in email send endpoint", { error });
    return createErrorResponse(errorMessage, 500);
  }
}
