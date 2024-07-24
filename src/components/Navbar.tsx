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
    <nav className=" absolute w-full  navbarColor z-20 ">
      <ul className="flex justify-between items-center p-2">
        <motion.li
          initial="hidden"
          animate="visible"
          transition={{ duration: 3, ease: "easeInOut" }}
          onMouseEnter={() => setHoveredLink("home")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <div className="flex items-center gap-2">
            <Link href="/" className="text-white flex items-center gap-2">
              <Image src="/logo.png" width={120} height={120} alt={""} />
            </Link>
          </div>
        </motion.li>
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
                  <li className="p-2 ">
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
            <a href="/#about" className="text-white text-2xl font-bold">
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
                    <a href="#about">Our Vision</a>
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
      </ul>
    </nav>
  );
};

export default Navbar;
