// components/GettingStarted.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const GettingStarted = () => {
  const Router = useRouter();

  return (
    <div className="py-16 bg-gradient-to-r from-gray-50 to-gray-200 text-gray-800 relative">
      <div className="container mx-auto text-center p-8">
        <motion.h2
          className="text-4xl font-extrabold mb-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Ready to Get Started?
        </motion.h2>
        <motion.p
          className="text-xl mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        >
          Let us help you turn your vision into reality. Get in touch with us
          today to discuss your project and find out how we can help you
          succeed.
        </motion.p>
        <motion.button
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => Router.push("/pricing")}
        >
          Get Started
        </motion.button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" />
    </div>
  );
};

export default GettingStarted;
