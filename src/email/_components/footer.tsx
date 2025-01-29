import { Container, Link, Text } from "@react-email/components";

import { BASE_URL } from "./constants";

type FooterProps = {
  showTerms?: boolean;
  className?: string;
};

export function Footer({ showTerms = false, className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {showTerms && (
        <Container className="bg-neutral-200/50 px-2 md:border-none md:bg-transparent md:px-0">
          <Text className="text-center text-xs leading-6 text-neutral-600">
            By accepting this invitation, you agree to our
            <span className="block">
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
        </Container>
      )}

      <Container
        className={`mx-auto mt-8 px-2 text-center md:mt-4 ${className}`}
      >
        <Text className="mt-0 text-xs leading-relaxed text-neutral-600">
          <span className="font-medium text-neutral-700">
            © {currentYear} Aware Healthcare Inc.
          </span>

          <br />

          <span className="text-neutral-500">
            223 Bedford Ave, Brooklyn, NY
          </span>
        </Text>
      </Container>
    </>
  );
}
