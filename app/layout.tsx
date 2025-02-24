import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Theme } from '@radix-ui/themes';
import "./globals.css";
import RootLayoutClient from './RootLayoutClient';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Histoire pour Enfants - AI",
  description: "Créez des histoires magiques pour vos enfants avec l'aide de l'IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        <Theme appearance="dark" accentColor="blue" radius="medium">
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </Theme>
      </body>
    </html>
  );
}
