"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const Hero = () => {
  const Router = useRouter();

  const textVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 2,
        ease: "easeOut",
      },
    },
  };

  const slideInVariants = {
    hidden: { opacity: 0, x: -200 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1.5,
        ease: "easeOut",
        delay: 2, // Add delay here
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 2,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        yoyo: Infinity, // Make it bounce back and forth
        duration: 0.3,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 2 },
    visible: {
      opacity: 1,
      scale: 1,
      backgroundColor: "#000000",
      transition: {
        duration: 3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <main className="relative flex flex-col justify-between items-center w-full h-screen">
      <motion.div
        className="absolute -z-10 w-full h-full"
        initial="hidden"
        animate="visible"
        variants={imageVariants}
      >
        <Image
          src="/heroBg.jpg"
          alt="background image"
          className="w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          fill
        />
      </motion.div>
      <div className="relative z-10 flex flex-col md:flex-row justify-center items-center w-full h-full space-y-6 md:space-y-0 md:space-x-12 px-6">
        <div className="flex flex-col justify-center items-center text-center mb-24 md:mb-0">
          <motion.h1
            className="text-white text-9xl font-extrabold gradient-text "
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
            className="text-white text-2xl"
            initial="hidden"
            animate="visible"
            variants={slideInVariants}
            transition={{ delay: 0.5 }} // Slight delay for a staggered effect
          >
            Where the best websites are crafted
          </motion.p>
        </div>
        <div className="flex flex-col justify-center items-center text-center bg-white bg-opacity-80 p-6 rounded-lg shadow-lg space-y-6 max-w-96">
          <motion.h1
            className="text-3xl font-bold"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 1 }}
          >
            Subheading
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 1.5 }}
            className="font-bold"
          >
            {/* Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum at,
            rem accusamus doloremque minima enim reprehenderit? Explicabo
            dolorum sint facilis minus reprehenderit omnis numquam voluptatem
            consequatur in vitae laboriosam a, praesentium aliquid similique?
            Labore deleniti ipsam nulla temporibus praesentium dolor. */}
            Launch your website quickly with our professional web development
            services. Get started with your highly functional and uniquely
            tailored website below.
          </motion.p>
          <motion.button
            className="px-6 py-3 bg-blue-600 text-white text-lg rounded-full shadow-lg"
            initial="hidden"
            animate="visible"
            variants={buttonVariants}
            whileHover="hover"
            onClick={() => Router.push("/pricing")}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </main>
  );
};

export default Hero;
