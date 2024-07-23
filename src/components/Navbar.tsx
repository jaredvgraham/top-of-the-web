"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <nav className="whiteBoxTwo bg-black ">
      <ul className="flex justify-between items-center p-6">
        <li>
          <Link href="/" className="text-white flex items-center gap-2">
            {/* <Image
              className="rounded-full"
              alt="logo"
              src="/logo.png"
              width={50}
              height={50}
            /> */}
            {!isMobile && <p>Top of the Web</p>}
          </Link>
        </li>
        <div className="flex justify-between gap-4">
          <li>
            <Link href="/pricing" className="text-white">
              Pricing
            </Link>
          </li>
          <li>
            <a href="/#about" className="text-white">
              About
            </a>
          </li>
          <li>
            <Link href="/contact" className="text-white">
              Contact
            </Link>
          </li>
        </div>
      </ul>
    </nav>
  );
};
export default Navbar;
