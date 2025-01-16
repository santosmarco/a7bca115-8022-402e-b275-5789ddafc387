import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { env } from "~/env";
import type { Tables } from "~/lib/supabase/database.types";

import tailwindEmailConfig from "./tailwind.config";

type InviteProfile = Pick<Tables<"profiles">, "email" | "nickname">;

export type InvitationEmailProps = {
  invite: Pick<
    Tables<"user_invites">,
    "id" | "email" | "first_name" | "last_name" | "role"
  > & {
    invited_by_profile: InviteProfile | null;
  };
};

const BASE_URL = env.NEXT_PUBLIC_SITE_URL;
if (!BASE_URL) throw new Error("NEXT_PUBLIC_SITE_URL is not defined");

const COMPANY_NAME = "Titan GameTape";

export function InvitationEmail({ invite }: InvitationEmailProps) {
  const previewText = `You're Invited to ${COMPANY_NAME} – Elevate Your Coaching Experience`;
  const fullName = [invite.first_name, invite.last_name]
    .filter(Boolean)
    .join(" ");
  const inviteUrl = new URL("/login", BASE_URL);
  inviteUrl.searchParams.set("invite", invite.id);

  return (
    <Html>
      <Preview>{previewText}</Preview>

      <Tailwind config={tailwindEmailConfig}>
        <Head />

        <Body className="mx-auto my-auto bg-white px-0 font-sans md:px-2">
          <Container className="mx-auto max-w-[465px] rounded-b p-5 md:my-8 md:rounded md:border md:border-solid md:border-neutral-300">
            <Section className="mx-auto mt-8 w-full text-center">
              <Img
                src={`${BASE_URL}/titan-logo-black.png`}
                width="auto"
                height="32"
                alt="Titan Logo"
                className="inline h-8"
              />
            </Section>

            <Heading className="mx-0 my-8 p-0 text-center text-2xl font-normal text-black">
              Join <strong>{COMPANY_NAME}</strong>
            </Heading>

            <Text className="text-sm leading-6 text-gray-800">
              Hello {invite.first_name},
            </Text>

            <Text className="text-pretty text-sm leading-6 text-gray-800">
              {invite.role === "coach" ? (
                <>
                  <strong>Titan</strong> has invited you to join as a coach on{" "}
                  <strong>{COMPANY_NAME}</strong>, the Meeting Intelligence
                  Platform designed for startup leaders and their coaches to
                  gain actionable insights from meetings.
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
                  <strong>{COMPANY_NAME}</strong>, the Meeting Intelligence
                  Platform designed for startup leaders and their coaches to
                  gain actionable insights from your meetings.
                </>
              ) : (
                <>
                  You&apos;ve been invited to join{" "}
                  <strong>{COMPANY_NAME}</strong>, the Meeting Intelligence
                  Platform designed for startup leaders and their coaches to
                  gain actionable insights from your meetings.
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

            <Hr className="my-6 w-full border border-neutral-300" />

            <Text className="text-xs leading-6 text-neutral-600">
              This invitation was intended for{" "}
              <span className="text-gray-800">{fullName}</span>. If you did not
              request this, you can safely ignore this email. For any concerns,
              contact our support team.
            </Text>
          </Container>

          <Container className="bg-neutral-200/50 px-2 md:border-none md:bg-transparent md:px-0">
            <Section className="text-center">
              <Text className="text-xs leading-6 text-neutral-600">
                By accepting this invitation, you agree to our{" "}
                <span className="block md:inline">
                  <Link
                    className="text-blue-500 no-underline transition-colors hover:text-blue-600"
                    href={`${BASE_URL}/terms`}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="text-blue-500 no-underline transition-colors hover:text-blue-600"
                    href={`${BASE_URL}/privacy`}
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </Text>

              <Text className="mt-8 hidden text-xs leading-relaxed text-neutral-600 md:block">
                <span className="font-medium text-neutral-700">
                  © {new Date().getFullYear()} Aware Healthcare Inc.
                </span>

                <br />

                <span className="text-neutral-500">
                  223 Bedford Ave, Brooklyn, NY
                </span>
              </Text>
            </Section>
          </Container>

          <Container className="mx-auto mt-8 px-2 text-center md:hidden">
            <Text className="mt-0 text-xs leading-relaxed text-neutral-600">
              <span className="font-medium text-neutral-700">
                © {new Date().getFullYear()} Aware Healthcare Inc.
              </span>

              <br />

              <span className="text-neutral-500">
                223 Bedford Ave, Brooklyn, NY
              </span>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
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
