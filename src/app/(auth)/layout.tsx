import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Titan",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <>{children}</>;
}
