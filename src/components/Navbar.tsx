"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

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

  const submenuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <nav className="absolute top-0 left-0 w-full  z-20">
      <ul className="flex justify-between items-center p-6">
        <motion.li
          initial="hidden"
          animate="visible"
          transition={{ duration: 3, ease: "easeInOut" }}
          onMouseEnter={() => setHoveredLink("home")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <Link href="/" className="text-white flex items-center gap-2">
            {!isMobile && <p>Top of the Web</p>}
          </Link>
        </motion.li>
        <div className="flex justify-between gap-4">
          <motion.li
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
            variants={linkVariants}
            onMouseEnter={() => setHoveredLink("pricing")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <Link href="/pricing" className="text-white">
              Pricing
            </Link>
            <AnimatePresence>
              {hoveredLink === "pricing" && (
                <motion.ul
                  className="absolute bg-white shadow-lg rounded-lg mt-2"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={submenuVariants}
                  transition={{ duration: 0.3 }}
                >
                  <li className="p-2">
                    <Link href="/pricing/basic">Basic Plan</Link>
                  </li>
                  <li className="p-2">
                    <Link href="/pricing/premium">Premium Plan</Link>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.li>
          <motion.li
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
            variants={linkVariants}
            onMouseEnter={() => setHoveredLink("mission")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <a href="/#about" className="text-white">
              Our Mission
            </a>
            <AnimatePresence>
              {hoveredLink === "mission" && (
                <motion.ul
                  className="absolute bg-white shadow-lg rounded-lg mt-2"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={submenuVariants}
                  transition={{ duration: 0.3 }}
                >
                  <li className="p-2">
                    <a href="/mission/vision">Our Vision</a>
                  </li>
                  <li className="p-2">
                    <a href="/mission/team">Our Team</a>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.li>
          <motion.li
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.7, ease: "easeInOut" }}
            variants={linkVariants}
            onMouseEnter={() => setHoveredLink("contact")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <Link href="/contact" className="text-white">
              Contact
            </Link>
            <AnimatePresence>
              {hoveredLink === "contact" && (
                <motion.ul
                  className="absolute bg-white shadow-lg rounded-lg mt-2"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={submenuVariants}
                  transition={{ duration: 0.3 }}
                >
                  <li className="p-2">
                    <Link href="/contact/email">Email Us</Link>
                  </li>
                  <li className="p-2">
                    <Link href="/contact/phone">Call Us</Link>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.li>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
