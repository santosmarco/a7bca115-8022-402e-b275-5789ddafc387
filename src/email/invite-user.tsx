import { Button, Link, Section, Text } from "@react-email/components";

import type { Tables } from "~/lib/supabase/database.types";

import { BASE_URL, COMPANY_NAME } from "./_components/constants";
import { EmailContainer } from "./_components/email-container";

type InviteProfile = Pick<Tables<"profiles">, "email" | "nickname">;

export type InvitationEmailProps = {
  invite: Pick<
    Tables<"user_invites">,
    "id" | "email" | "first_name" | "last_name" | "role"
  > & {
    invited_by_profile: InviteProfile | null;
  };
};

export function InvitationEmail({ invite }: InvitationEmailProps) {
  const previewText = `You're Invited to ${COMPANY_NAME} – Elevate Your Coaching Experience`;
  const fullName = [invite.first_name, invite.last_name]
    .filter(Boolean)
    .join(" ");
  const inviteUrl = new URL("/login", BASE_URL);
  inviteUrl.searchParams.set("invite", invite.id);

  return (
    <EmailContainer
      previewText={previewText}
      headerProps={{
        heading: (
          <>
            Join <strong>{COMPANY_NAME}</strong>
          </>
        ),
      }}
      footerProps={{ showTerms: true }}
    >
      <Text className="text-sm leading-6 text-gray-800">
        Hello {invite.first_name},
      </Text>

      <Text className="text-pretty text-sm leading-6 text-gray-800">
        {invite.role === "coach" ? (
          <>
            <strong>Titan</strong> has invited you to join as a coach on{" "}
            <strong>{COMPANY_NAME}</strong>, the Meeting Intelligence Platform
            designed for startup leaders and their coaches to gain actionable
            insights from meetings.
          </>
        ) : invite.invited_by_profile ? (
          <>
            <strong>{invite.invited_by_profile.nickname}</strong> (
            <Link
              href={`mailto:${invite.invited_by_profile.email}`}
              className="text-blue-600 no-underline hover:text-blue-700"
            >
              {invite.invited_by_profile.email}
            </Link>
            ) has invited you to join them as a client on{" "}
            <strong>{COMPANY_NAME}</strong>, the Meeting Intelligence Platform
            designed for startup leaders and their coaches to gain actionable
            insights from your meetings.
          </>
        ) : (
          <>
            You&apos;ve been invited to join <strong>{COMPANY_NAME}</strong>,
            the Meeting Intelligence Platform designed for startup leaders and
            their coaches to gain actionable insights from your meetings.
          </>
        )}
      </Text>

      <Section className="my-8 text-center">
        <Button
          className="rounded bg-black px-5 py-3 text-xs font-semibold text-white no-underline hover:bg-gray-900"
          href={inviteUrl.toString()}
        >
          Accept Invitation
        </Button>
      </Section>

      <Text className="text-sm leading-6 text-gray-800">
        or copy and paste this link into your browser:
      </Text>

      <Section className="my-4 rounded-lg border border-neutral-300 bg-neutral-200 px-4 py-3">
        <Link
          href={inviteUrl.toString()}
          className="break-all text-sm text-blue-600 no-underline hover:text-blue-700"
        >
          {inviteUrl.toString()}
        </Link>
      </Section>

      <Text className="text-xs leading-6 text-neutral-600">
        This invitation was intended for{" "}
        <span className="text-gray-800">{fullName}</span>. If you did not
        request this, you can safely ignore this email. For any concerns,
        contact our support team.
      </Text>
    </EmailContainer>
  );
}

const previewProps = {
  invite: {
    id: "123",
    email: "test@test.com",
    first_name: "John",
    last_name: null,
    role: "user" as const,
    invited_by_profile: {
      nickname: "John Doe",
      email: "john@doe.com",
    },
  },
} satisfies { invite: InvitationEmailProps["invite"] };

InvitationEmail.PreviewProps = previewProps;

export default InvitationEmail;
