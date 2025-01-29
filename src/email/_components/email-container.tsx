import { Body, Container, Head } from "@react-email/components";
import { Html } from "@react-email/components";
import { Preview } from "@react-email/components";
import { Tailwind } from "@react-email/components";

import tailwindEmailConfig from "../tailwind.config";
import { Footer } from "./footer";
import { Header } from "./header";

export type EmailContainerProps = {
  previewText: string;
  children: React.ReactNode;
  headerProps?: React.ComponentProps<typeof Header>;
  footerProps?: React.ComponentProps<typeof Footer>;
};

export function EmailContainer({
  previewText,
  children,
  headerProps,
  footerProps,
}: EmailContainerProps) {
  return (
    <Html>
      <Preview>{previewText}</Preview>

      <Tailwind config={tailwindEmailConfig}>
        <Head />

        <Body className="mx-auto my-auto bg-white px-0 font-sans md:px-2">
          <Container className="mx-auto max-w-[465px] rounded-b p-5 md:my-8 md:rounded md:border md:border-solid md:border-neutral-300">
            <Header {...headerProps} />

            {children}
          </Container>

          <Footer {...footerProps} />
        </Body>
      </Tailwind>
    </Html>
  );
}
