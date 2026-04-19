/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { LangProvider } from "@/context/LangContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "investAI",
  description: "investAI - your financial dost for smarter money decisions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
