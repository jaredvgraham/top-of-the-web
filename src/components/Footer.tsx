// components/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        {/* Brand Section */}
        <div className="mb-8 md:mb-0 text-center md:text-left">
          <Link
            href="/"
            className="flex items-center justify-center md:justify-start"
          >
            <Image
              src="/white-logo.png"
              width={120}
              height={120}
              alt="Bsites.io"
            />
          </Link>
          <p className="mt-4 text-sm">
            Bsites.io provides innovative web development solutions tailored to
            your business needs. Empowering your digital presence.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="mb-8 md:mb-0">
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-center md:text-left">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:underline">
                Services
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="mb-8 md:mb-0 text-center md:text-left">
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p className="text-sm">
            1234 Web Dev Lane
            <br />
            City, State, 56789
          </p>
          <p className="text-sm mt-2">
            Email:{" "}
            <a href="mailto:info@bsites.io" className="hover:underline">
              info@bsites.io
            </a>
          </p>
          <p className="text-sm mt-2">
            Phone:{" "}
            <a href="tel:+1234567890" className="hover:underline">
              +1 234 567 890
            </a>
          </p>
        </div>

        {/* Social Media Links */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex justify-center md:justify-start space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:text-gray-400"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:text-gray-400"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:text-gray-400"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:text-gray-400"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="mt-8 text-center border-t border-gray-700 pt-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Bsites.io. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
