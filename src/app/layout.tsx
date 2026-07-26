import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbars/Navbar";
import AdminNavbar from "@/components/navbars/AdminNavbar";
import MetaPixel from "@/components/analytics/MetaPixel";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bsites.io"),
  title: "Bsites.io - Free Website Build + $84/mo Hosting",
  description:
    "Custom websites built for free with managed hosting, maintenance, and basic updates for $84/month.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${spaceGrotesk.variable} bg-paper font-sans text-ink max-w-full overflow-x-hidden`}
      >
        <MetaPixel />
        <Navbar />
        <AdminNavbar />
        {children}
      </body>
    </html>
  );
}
