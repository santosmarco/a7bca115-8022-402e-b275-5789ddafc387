import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Titan",
  description: "Discover insights from your recorded meetings",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
} satisfies Metadata;

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark bg-background text-foreground`}
    >
      <body>
        <NuqsAdapter>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}