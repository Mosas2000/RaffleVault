import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "RaffleVault - Decentralized Raffles on Base",
    template: "%s | RaffleVault"
  },
  description: "Create and participate in transparent, verifiable raffles on Base blockchain. Powered by Chainlink VRF for provably fair winner selection.",
  keywords: ["raffle", "base", "blockchain", "web3", "ethereum", "chainlink", "vrf", "lottery", "crypto"],
  authors: [{ name: "RaffleVault Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rafflevault.app",
    title: "RaffleVault - Decentralized Raffles on Base",
    description: "Create and participate in transparent, verifiable raffles on Base blockchain",
    siteName: "RaffleVault",
  },
  twitter: {
    card: "summary_large_image",
    title: "RaffleVault - Decentralized Raffles on Base",
    description: "Create and participate in transparent, verifiable raffles on Base blockchain",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
