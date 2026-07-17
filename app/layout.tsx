
import type { Metadata } from "next";
import "./globals.css";
import { ConditionalFooter } from "../components/ConditionalFooter";
import { Inter } from "next/font/google";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import Providers from "../components/provider";

export const metadata = {
  title: "Serve",
  description: "Plataforma de gerenciamento de restaurantes",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body
        className="min-h-screen flex flex-col antialiased bg-(--color-background)"
        suppressHydrationWarning
      >
        <Providers>
          <main className="flex-1">
            <Header />
            {children}
            <ConditionalFooter />
          </main>
        </Providers>
      </body>
    </html>
  );
}
