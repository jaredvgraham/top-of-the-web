// components/Navbar.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MenuIcon, XIcon } from "@heroicons/react/solid";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
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
    <nav
      className={`w-full z-20 ${
        isHomePage ? "absolute navbarColor" : "gradient-bg"
      }`}
    >
      <ul className="flex justify-between items-center p-2">
        <motion.li
          initial="hidden"
          animate="visible"
          transition={{ duration: 3, ease: "easeInOut" }}
          onMouseEnter={() => setHoveredLink("home")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <div className="flex items-center gap-2">
            <Link href="/" className="gradient-text flex items-center gap-2">
              <Image src="/white-logo.png" width={120} height={120} alt={""} />
            </Link>
          </div>
        </motion.li>

        {isMobile ? (
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? (
                <XIcon className="h-8 w-8" />
              ) : (
                <MenuIcon className="h-16 w-16" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex justify-around gap-4 w-1/2">
            <motion.li
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              variants={linkVariants}
              onMouseEnter={() => setHoveredLink("pricing")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Link href="/pricing" className="text-white text-2xl font-bold">
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
              <a href="/mission" className="text-white text-2xl font-bold">
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
                      <a href="/mission/our-vision">Our Vision</a>
                    </li>
                    <li className="p-2">
                      <a href="/mission/ourTeam">Our Team</a>
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
              <Link href="/contact" className="text-white text-2xl font-bold">
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
        )}
      </ul>

      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <motion.div
            ref={menuRef}
            className="absolute top-0 left-0 w-full bg-white shadow-lg rounded-lg z-10"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ul>
              <li className="p-4">
                <Link href="/pricing" className="text-black text-2xl font-bold">
                  Pricing
                </Link>
              </li>
              <li className="p-4">
                <a href="/mission" className="text-black text-2xl font-bold">
                  Our Mission
                </a>
              </li>
              <li className="p-4">
                <Link href="/contact" className="text-black text-2xl font-bold">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
