"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MenuIcon, XIcon, UserIcon } from "@heroicons/react/solid";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { role, logout } = useAuth();
  const [url, setUrl] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdminPage = pathname.includes("/admin");
  const isHomePage = pathname === "/";

  useEffect(() => {
    const callEndpoint = async () => {
      try {
        const res = await axiosPrivate.post("/stripe/portal");
        console.log(res.data.url);
        setUrl(res.data.url);
      } catch (error) {
        console.log(error);
      }
    };
    callEndpoint();
  }, [role, logout]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1008);
    };
    //

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setOpenSubmenu(null);
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

  const handleToggleSubmenu = (submenu: string) => {
    setOpenSubmenu((prev) => (prev === submenu ? null : submenu));
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const submenuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  if (isAdminPage) return null;

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
          <div className="flex justify-around gap-4 w-3/4">
            <motion.li
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              variants={linkVariants}
              onMouseEnter={() => setOpenSubmenu("pricing")}
              onMouseLeave={() => setOpenSubmenu(null)}
            >
              <Link href="/pricing" className="text-white text-2xl font-bold">
                Pricing
              </Link>
              <AnimatePresence>
                {openSubmenu === "pricing" && (
                  <motion.ul
                    className="absolute bg-white shadow-lg rounded-lg z-30 mt-2"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={submenuVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <li className="p-2">
                      <Link href="/pricing">All Plans</Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/starter-website-package">
                        Starter Plan
                      </Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/standard-website-package">
                        Standard Plan
                      </Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/advanced-website-package">
                        Advanced Plan
                      </Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/enterprise-website-package">
                        Enterprise Plan
                      </Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/e-commerce-website-package">
                        E-commerce Plan
                      </Link>
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
              onMouseEnter={() => setOpenSubmenu("mission")}
              onMouseLeave={() => setOpenSubmenu(null)}
            >
              <a href="/mission" className="text-white text-2xl font-bold">
                Our Mission
              </a>
              <AnimatePresence>
                {openSubmenu === "mission" && (
                  <motion.ul
                    className="absolute bg-white shadow-lg rounded-lg mt-2 z-10"
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
              onMouseEnter={() => setOpenSubmenu("contact")}
              onMouseLeave={() => setOpenSubmenu(null)}
            >
              <Link href="/contact" className="text-white text-2xl font-bold">
                Contact
              </Link>
            </motion.li>

            <motion.li
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 0.9, ease: "easeInOut" }}
              variants={linkVariants}
            >
              <Link href="/blog" className="text-white text-2xl font-bold">
                Blog
              </Link>
            </motion.li>
            <motion.li
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 1.1, ease: "easeInOut" }}
              variants={linkVariants}
              onMouseEnter={() => setOpenSubmenu("profile")}
              onMouseLeave={() => setOpenSubmenu(null)}
              className="relative"
            >
              <button className="flex items-center text-white text-2xl">
                <UserIcon className="h-8 w-8" />
              </button>
              <AnimatePresence>
                {openSubmenu === "profile" && (
                  <motion.div
                    className="absolute bg-white shadow-lg rounded-lg z-30 right-0 mt-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {!role ? (
                      <motion.ul
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={submenuVariants}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.li className="p-2">
                          <Link href="/login">Login</Link>
                        </motion.li>
                        <motion.li className="p-2">
                          <Link href="/signup">Sign Up</Link>
                        </motion.li>
                      </motion.ul>
                    ) : (
                      <motion.ul
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={submenuVariants}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.li className="p-2">
                          <button onClick={logout}>Logout</button>
                        </motion.li>
                        <motion.li className="p-2">
                          <a href={url}>Billing</a>
                        </motion.li>
                        <motion.li className="p-2">
                          <Link href="/user/dashboard">User Dashboard</Link>
                        </motion.li>
                      </motion.ul>
                    )}
                  </motion.div>
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
                <button
                  className="text-black text-2xl font-bold w-full text-left"
                  onClick={() => handleToggleSubmenu("pricing")}
                >
                  Pricing
                </button>
                {openSubmenu === "pricing" && (
                  <motion.ul
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={submenuVariants}
                    transition={{ duration: 0.3 }}
                    className="pl-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <li className="p-2">
                      <Link href="/pricing">All Plans</Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/starter-website-package">
                        Starter Plan
                      </Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/standard-website-package">
                        Standard Plan
                      </Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/advanced-website-package">
                        Advanced Plan
                      </Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/enterprise-website-package">
                        Enterprise Plan
                      </Link>
                    </li>
                    <li className="p-2">
                      <Link href="/pricing/e-commerce-website-package">
                        E-commerce Plan
                      </Link>
                    </li>
                  </motion.ul>
                )}
              </li>
              <li className="p-4">
                <button
                  className="text-black text-2xl font-bold w-full text-left"
                  onClick={() => handleToggleSubmenu("mission")}
                >
                  Our Mission
                </button>
                {openSubmenu === "mission" && (
                  <motion.ul
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={submenuVariants}
                    transition={{ duration: 0.3 }}
                    className="pl-4"
                  >
                    <li className="p-2">
                      <a href="/mission/our-vision">Our Vision</a>
                    </li>
                    <li className="p-2">
                      <a href="/mission/ourTeam">Our Team</a>
                    </li>
                  </motion.ul>
                )}
              </li>
              <li className="p-4">
                <Link
                  href="/contact"
                  className="text-black text-2xl font-bold w-full text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li className="p-4">
                <Link
                  href="/blog"
                  className="text-black text-2xl font-bold w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>
              </li>
              <li className="p-4" onClick={() => setOpenSubmenu("profile")}>
                <button className="flex items-center text-black text-2xl w-full">
                  <UserIcon
                    className="h-8 w-8"
                    onClick={() => setOpenSubmenu("profile")}
                  />
                </button>
                <AnimatePresence>
                  {openSubmenu === "profile" &&
                    (!role ? (
                      <motion.ul
                        className="pl-4"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={submenuVariants}
                        transition={{ duration: 0.3 }}
                      >
                        <li className="p-2">
                          <Link
                            href="/login"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Login
                          </Link>
                        </li>
                        <li className="p-2">
                          <Link
                            href="/signup"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </li>
                      </motion.ul>
                    ) : (
                      <motion.ul
                        className="pl-4"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={submenuVariants}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.li className="p-2">
                          <button onClick={logout}>Logout</button>
                        </motion.li>
                        <motion.li className="p-2">
                          <a href={url}>Billing</a>
                        </motion.li>
                        <motion.li className="p-2">
                          <Link
                            onClick={() => setIsMenuOpen(false)}
                            href="/user/dashboard"
                          >
                            User Dashboard
                          </Link>
                        </motion.li>
                      </motion.ul>
                    ))}
                </AnimatePresence>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
