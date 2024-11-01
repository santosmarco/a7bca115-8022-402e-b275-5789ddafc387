import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";

import { AppSidebar } from "~/components/app-sidebar";
import { TRPCReactProvider } from "~/trpc/react";
import { api } from "~/trpc/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Titan",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  let user;
  try {
    user = await api.auth.getUser();
  } catch {
    redirect("/login");
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} dark bg-background text-foreground`}
    >
      <body>
        <TRPCReactProvider>
          <AppSidebar user={user} />

          <div className="pl-64">
            <main className="p-12">{children}</main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
