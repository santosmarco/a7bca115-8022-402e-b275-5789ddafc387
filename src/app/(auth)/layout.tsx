import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Titan",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

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
      <TRPCReactProvider>
        <body>{children}</body>
      </TRPCReactProvider>
    </html>
  );
}