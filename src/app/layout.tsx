import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbars/Navbar";
import AdminNavbar from "@/components/navbars/AdminNavbar";
import MetaPixel from "@/components/analytics/MetaPixel";
import PwaRegister from "@/components/PwaRegister";

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
  title: {
    default: "Bsites.io — Just $495 Website + Hosting",
    template: "%s | Bsites.io",
  },
  description:
    "Free Facebook demo, then just $495 for a custom website with hosting included. One customer pays for the life of your website.",
  applicationName: "Bsites Admin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bsites Admin",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#5B2E9E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <PwaRegister />
        <Navbar />
        <AdminNavbar />
        {children}
      </body>
    </html>
  );
}
