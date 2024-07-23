"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <main className="flex flex-col justify-between items-center">
      <div className="relative w-full h-screen">
        <motion.div
          className="absolute -z-10 w-full hero-height"
          initial={{ opacity: 0, scale: 2 }}
          animate={{ opacity: 0.9, scale: 1, backgroundColor: "#000000" }}
          transition={{
            duration: 3,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/heroBg.jpg"
            alt="background image"
            className="w-full"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              opacity: 0.9,
            }}
            fill
          />
        </motion.div>
        <div className="absolute inset-0 flex flex-col justify-center items-center mb-24 space-y-6">
          <motion.h1
            className="text-white text-7xl text-center"
            initial={{ opacity: 0, y: -100, x: 0 }}
            animate={{
              opacity: 1,
              y: [0, 100, 50, 0], // Keyframes for y position
              x: [0, 50, 100, 0], // Keyframes for x position
              rotate: [0, 0, 0, 360], // Keyframes for rotation
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
            }}
          >
            Welcome to, <br />
            Bsites.io
          </motion.h1>
          <motion.p
            className="text-white text-2xl text-center"
            initial={{ opacity: 0, y: 100, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 3 }}
          >
            Where the best websites are crafted
          </motion.p>
          <motion.button
            className="mt-8 px-6 py-3 bg-blue-600 text-white text-lg rounded-full shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </main>
  );
};

export default Hero;
