"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const slideInVariants = (direction: string) => ({
  hidden: { opacity: 0, x: direction === "left" ? -100 : 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1 },
  },
});

const OurWork = () => {
  const [ref1, inView1] = useInView({ triggerOnce: true });
  const [ref2, inView2] = useInView({ triggerOnce: true });

  return (
    <div className="bg-gray-100">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        Happy Clients
      </h1>
      <div className="p-8 mt-4 bg-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <motion.section
          className="mb-16"
          ref={ref1}
          initial="hidden"
          animate={inView1 ? "visible" : "hidden"}
          variants={slideInVariants("left")}
        >
          <a href="https://grahampowerwashing.com">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700 hover:underline hover:text-blue-500">
              Graham Powerwashing
            </h2>
          </a>
          <div className="flex justify-center items-center">
            <div className="iframe-container">
              <iframe
                src="https://grahampowerwashing.com"
                title="Graham Powerwashing"
                className="iframe"
              ></iframe>
            </div>
          </div>
        </motion.section>
        <motion.section
          className="mb-16"
          ref={ref2}
          initial="hidden"
          animate={inView2 ? "visible" : "hidden"}
          variants={slideInVariants("right")}
        >
          <a href="https://jakecleanscars.com">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700 hover:underline hover:text-blue-500">
              Jake Cleans Cars
            </h2>
          </a>
          <div className="flex justify-center items-center">
            <div className="iframe-container">
              <iframe
                src="https://jakecleanscars.com"
                title="Jake Cleans Cars"
                className="iframe"
              ></iframe>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default OurWork;
