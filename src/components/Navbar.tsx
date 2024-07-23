"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

  const linkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <nav className="whiteBoxTwo lightC w-full">
      <ul className="flex justify-between items-center p-6">
        <motion.li
          initial="hidden"
          animate="visible"
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          <Link href="/" className="text-gray-600 flex items-center gap-2">
            {/* <Image
              className="rounded-full"
              alt="logo"
              src="/logo.png"
              width={50}
              height={50}
            /> */}
            {!isMobile && <p>Top of the Web</p>}
          </Link>
        </motion.li>
        <div className="flex justify-between gap-4">
          <motion.li
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
            variants={linkVariants}
          >
            <Link href="/pricing" className="text-gray-600">
              Pricing
            </Link>
          </motion.li>
          <motion.li
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
            variants={linkVariants}
          >
            <a href="/#about" className="text-gray-600">
              Our Mission
            </a>
          </motion.li>
          <motion.li
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.7, ease: "easeInOut" }}
            variants={linkVariants}
          >
            <Link href="/contact" className="text-gray-600">
              Contact
            </Link>
          </motion.li>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
