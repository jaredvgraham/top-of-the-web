"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactCard = () => {
  return (
    <motion.div
      id="contact"
      className="relative bg-white p-8 rounded-lg shadow-lg max-w-lg w-full"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="bg-gradient-to-r from-gray-400 to-gray-600 p-6 rounded-t-lg">
        <h2 className="text-4xl font-bold text-white text-center">
          Contact Us
        </h2>
      </div>
      <div className="p-8">
        <div className="flex items-center mb-6">
          <FaPhone className="text-blue-500 text-2xl mr-4" />
          <p className="text-gray-700 text-lg">(123) 456-7890</p>
        </div>
        <div className="flex items-center mb-6">
          <FaEnvelope className="text-green-500 text-2xl mr-4" />
          <a
            href="mailto:bsitesioteam@gmail.com"
            className="text-gray-700 text-lg hover:underline"
          >
            bsitesioteam@gmail.com
          </a>
        </div>
        <div className="flex items-center mb-6">
          <FaMapMarkerAlt className="text-red-500 text-2xl mr-4" />
          <p className="text-gray-700 text-lg">
            123 Web Dev Lane, Code City, DevState
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactCard;
