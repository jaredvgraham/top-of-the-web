import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbars/Navbar";

import AdminNavbar from "@/components/navbars/AdminNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bsites.io",
  description: "Build your website with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 max-w-full overflow-x-hidden`}
      >
        <Navbar />

        <AdminNavbar />
        {children}
      </body>
    </html>
  );
}
