import { Container, Heading, Img, Section } from "@react-email/components";

import { BASE_URL } from "./constants";

type HeaderProps = {
  heading?: React.ReactNode;
  className?: string;
};

export function Header({ heading, className = "" }: HeaderProps) {
  return (
    <Container className={`mx-auto max-w-[465px] ${className}`}>
      <Section className="mx-auto mt-8 w-full text-center">
        <Img
          src={`${BASE_URL}/titan-logo-black.png`}
          width="auto"
          height="32"
          alt="Titan Logo"
          className="inline h-8"
        />
      </Section>

      {heading && (
        <Heading className="mx-0 my-8 p-0 text-center text-2xl font-normal text-black">
          {heading}
        </Heading>
      )}
    </Container>
  );
}
