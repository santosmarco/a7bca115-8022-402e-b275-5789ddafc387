import { Button, Hr, Link, Section, Text } from "@react-email/components";

import type { Tables } from "~/lib/supabase/database.types";

import { BASE_URL, COMPANY_NAME } from "./_components/constants";
import { EmailContainer } from "./_components/email-container";

type Profile = Pick<Tables<"profiles">, "nickname" | "email">;

export type ExploreUnlockedEmailProps = {
  profile: Profile;
};

export function ExploreUnlockedEmail({ profile }: ExploreUnlockedEmailProps) {
  const previewText =
    "🎉 Congrats! Start Exploring Your Performance with GameTape";
  const exploreUrl = new URL("/insights", BASE_URL);
  const bestPracticesUrl = new URL("/best-practices", BASE_URL);

  return (
    <EmailContainer previewText={previewText}>
      <Text className="text-sm leading-6 text-gray-800">
        Hi {profile.nickname},
      </Text>

      <Text className="text-pretty text-sm leading-6 text-gray-800">
        You&apos;ve officially recorded your first 10 meetings with{" "}
        <strong>{COMPANY_NAME}</strong>! Now, you can explore key moments,
        patterns, and insights with both your coach and AI in the{" "}
        <strong>Explore Chat</strong>.
      </Text>

      <Text className="text-pretty text-sm leading-6 text-gray-800">
        🚀 GameTape helps you uncover actionable insights to level up your
        leadership.
      </Text>

      <Section className="my-8 text-center">
        <Button
          className="rounded bg-black px-5 py-3 text-xs font-semibold text-white no-underline hover:bg-gray-900"
          href={exploreUrl.toString()}
        >
          Explore Your GameTape Now
        </Button>
      </Section>

      <Text className="text-sm leading-6 text-gray-800">
        Want pro tips on making the most of Titan & GameTape? Check out our{" "}
        <Link
          href={bestPracticesUrl.toString()}
          className="font-medium text-blue-600 no-underline hover:text-blue-700"
        >
          Best Practices Guide
        </Link>
        .
      </Text>

      <Text className="text-sm leading-6 text-gray-800">
        Have any questions? We&apos;re here to help!
      </Text>

      <Hr />

      <Text className="text-sm leading-6 text-gray-800">
        Best,
        <br />
        The {COMPANY_NAME} Team
      </Text>
    </EmailContainer>
  );
}

const previewProps = {
  profile: {
    nickname: "John",
    email: "john@example.com",
  },
} satisfies { profile: ExploreUnlockedEmailProps["profile"] };

ExploreUnlockedEmail.PreviewProps = previewProps;

export default ExploreUnlockedEmail;
