import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Deals Tennis — Bons plans raquettes, cordages, chaussures et textile",
    template: "%s | Deals Tennis",
  },
  description:
    "Le catalogue des meilleures promotions sur le matériel de tennis : raquettes, cordages, chaussures, textile et accessoires, sélectionnés et mis à jour en continu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
