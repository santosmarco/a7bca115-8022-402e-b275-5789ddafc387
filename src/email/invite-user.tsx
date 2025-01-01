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

type InviteProfile = Pick<Tables<"profiles">, "email" | "nickname">;

type InvitationEmailProps = {
  invite: Pick<
    Tables<"user_invites">,
    "id" | "email" | "first_name" | "last_name"
  > & {
    invited_by_profile: InviteProfile | null;
  };
};

const BASE_URL = env.NEXT_PUBLIC_SITE_URL;
if (!BASE_URL) throw new Error("NEXT_PUBLIC_SITE_URL is not defined");

const COMPANY_NAME = "Titan";

export function InvitationEmail({ invite }: InvitationEmailProps) {
  const previewText = `Join ${COMPANY_NAME} - Your Invitation Inside`;
  const fullName = [invite.first_name, invite.last_name]
    .filter(Boolean)
    .join(" ");
  const inviteUrl = new URL("/auth/signup", BASE_URL);
  inviteUrl.searchParams.set("invite", invite.id);

  return (
    <Html>
      <Preview>{previewText}</Preview>

      <Tailwind>
        <Head />

        <Body className="mx-auto my-auto bg-neutral-950 px-0 font-sans md:px-2">
          <Container className="mx-auto max-w-[465px] rounded-b p-5 md:my-8 md:rounded md:border md:border-solid md:border-neutral-700">
            <Section className="mt-8 flex justify-center">
              <Img
                src={`${BASE_URL}/titan-logo.png`}
                width="auto"
                height="32"
                alt="Titan Logo"
                className="h-8"
              />
            </Section>
            <Heading className="mx-0 my-8 p-0 text-center text-2xl font-normal text-white">
              Join <strong>{COMPANY_NAME}</strong>
            </Heading>
            <Text className="text-sm leading-6 text-gray-200">
              Hello {invite.first_name},
            </Text>
            <Text className="text-sm leading-6 text-gray-200">
              {invite.invited_by_profile && (
                <>
                  <strong>{invite.invited_by_profile.nickname}</strong> (
                  <Link
                    href={`mailto:${invite.invited_by_profile.email}`}
                    className="text-blue-400 no-underline hover:text-blue-300"
                  >
                    {invite.invited_by_profile.email}
                  </Link>
                  )
                </>
              )}{" "}
              has invited you to join them as a client on{" "}
              <strong>{COMPANY_NAME}</strong>.
            </Text>
            <Section className="my-8 text-center">
              <Button
                className="rounded bg-white px-5 py-3 text-xs font-semibold text-black no-underline hover:bg-gray-100"
                href={inviteUrl.toString()}
              >
                Accept Invitation
              </Button>
            </Section>
            <Text className="text-sm leading-6 text-gray-200">
              or copy and paste this URL into your browser:
            </Text>
            <Section className="my-4 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3">
              <Link
                href={inviteUrl.toString()}
                className="break-all text-sm text-blue-400 no-underline hover:text-blue-300"
              >
                {inviteUrl.toString()}
              </Link>
            </Section>
            <Hr className="my-6 w-full border border-neutral-700" />
            <Text className="text-xs leading-6 text-neutral-400">
              This invitation was intended for{" "}
              <span className="text-gray-200">{fullName}</span>. If you were not
              expecting this invitation, you can safely ignore this email. If
              you have any questions, please reply to this email to get in touch
              with us.
            </Text>
          </Container>

          <Container className="bg-neutral-800/50 px-2 md:border-none md:bg-transparent md:px-0">
            <Section className="text-center">
              <Text className="text-xs leading-6 text-neutral-400">
                By accepting this invitation, you agree to our{" "}
                <span className="block md:inline">
                  <Link
                    className="text-blue-500 no-underline transition-colors hover:text-blue-400"
                    href={`${BASE_URL}/terms`}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="text-blue-500 no-underline transition-colors hover:text-blue-400"
                    href={`${BASE_URL}/privacy`}
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </Text>

              <Text className="mt-8 hidden text-xs leading-relaxed text-neutral-400 md:block">
                <span className="font-medium text-neutral-300">
                  {COMPANY_NAME} Technologies, Inc.
                </span>
                <br />
                <span className="text-neutral-500">
                  240 Kent Avenue
                  <br />
                  11249 Brooklyn
                  <br />
                  United States
                </span>
              </Text>

              <Text className="mt-6 hidden text-xs text-neutral-500 md:block">
                © {new Date().getFullYear()} {COMPANY_NAME}. All rights
                reserved.
              </Text>
            </Section>
          </Container>

          <Container className="mx-auto mt-8 px-2 text-center md:hidden">
            <Text className="mt-0 text-xs leading-relaxed text-neutral-400">
              <span className="font-medium text-neutral-300">
                {COMPANY_NAME} Technologies, Inc.
              </span>
              <br />
              <span className="text-neutral-500">
                240 Kent Avenue
                <br />
                11249 Brooklyn
                <br />
                United States
              </span>
            </Text>

            <Text className="mt-6 text-xs text-neutral-500">
              © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
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
    invited_by_profile: {
      nickname: "John Doe",
      email: "john@doe.com",
    },
  },
} satisfies { invite: InvitationEmailProps["invite"] };

InvitationEmail.PreviewProps = previewProps;

export default InvitationEmail;
