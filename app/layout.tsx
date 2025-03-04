import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StoryAI - Créez des histoires magiques",
  description: "Créez des histoires magiques pour vos enfants avec l'aide de l'IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Theme appearance="dark" accentColor="blue" scaling="100%" radius="medium">
          {children}
        </Theme>
      </body>
    </html>
  );
}
