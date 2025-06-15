"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaPhone, FaEnvelope } from "react-icons/fa";

const ContactCard = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      id="contact"
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-800">Get in Touch</h2>
        <p className="text-gray-500 mt-2">
          We're here to help and answer any question you might have.
        </p>
      </div>
      <div className="space-y-6">
        <motion.div className="flex items-center" variants={itemVariants}>
          <div className="bg-blue-100 p-3 rounded-full">
            <FaPhone className="text-blue-600 text-xl" />
          </div>
          <a
            href="tel:+17813367274"
            className="ml-4 text-gray-700 text-lg hover:text-blue-600 transition-colors"
          >
            (781) 336-7274
          </a>
        </motion.div>
        <motion.div className="flex items-center" variants={itemVariants}>
          <div className="bg-green-100 p-3 rounded-full">
            <FaEnvelope className="text-green-600 text-xl" />
          </div>
          <a
            href="mailto:bsitesioteam@gmail.com"
            className="ml-4 text-gray-700 text-lg hover:text-green-600 transition-colors"
          >
            bsitesioteam@gmail.com
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactCard;
