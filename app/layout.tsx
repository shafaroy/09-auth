import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Roboto } from "next/font/google";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import AuthProvider from "@/components/AuthProvider/AuthProvider";

import { openGraphImage, siteUrl } from "@/lib/metadata";

import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "NoteHub",
  description:
    "Create, search, and organize your personal notes with NoteHub. Keep your ideas, tasks, and plans in one place.",
  openGraph: {
    title: "NoteHub",
    description:
      "Create, search, and organize your personal notes with NoteHub. Keep your ideas, tasks, and plans in one place.",
    url: new URL("/", siteUrl).toString(),
    images: [openGraphImage],
  },
};

interface RootLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function RootLayout({
  children,
  modal,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${roboto.className}`}>
        <TanStackProvider>
          <AuthProvider>
            <Header />
            {children}
            {modal}
            <Footer />
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
