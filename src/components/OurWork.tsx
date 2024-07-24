"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const slideInVariants = (direction: string, delayAmount: number) => ({
  hidden: { opacity: 0, x: direction === "left" ? -100 : 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1, delay: delayAmount },
  },
});

const OurWork = () => {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.4 });

  return (
    <div className="">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        Happy Clients
      </h1>
      <div className="p-8 mt-4  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <motion.section
          className="mb-16 "
          ref={ref1}
          initial="hidden"
          animate={inView1 ? "visible" : "hidden"}
          variants={slideInVariants("left", 0.2)}
        >
          <a href="https://grahampowerwashing.com">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700 hover:underline hover:text-blue-500">
              Graham Powerwashing
            </h2>
          </a>
          <div className="flex justify-center items-center">
            <div className="iframe-container shadow-2xl">
              <iframe
                src="https://grahampowerwashing.com"
                title="Graham Powerwashing"
                className="iframe "
              ></iframe>
            </div>
          </div>
          <a href="https://grahampowerwashing.com">
            <h2 className="text-xl italic font-semibold text-center mb-8 text-blue-500 underline">
              GrahamPowerWashing.com
            </h2>
          </a>
        </motion.section>
        <motion.section
          className="mb-16"
          ref={ref2}
          initial="hidden"
          animate={inView2 ? "visible" : "hidden"}
          variants={slideInVariants("right", 0.4)}
        >
          <a href="https://jakecleanscars.com">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700 hover:underline hover:text-blue-500">
              Jake Cleans Cars
            </h2>
          </a>
          <div className="flex justify-center items-center">
            <div className="iframe-container shadow-2xl">
              <iframe
                src="https://jakecleanscars.com"
                title="Jake Cleans Cars"
                className="iframe"
              ></iframe>
            </div>
          </div>
          <a href="https://jakecleanscars.com">
            <h2 className="text-xl italic font-semibold text-center mb-8 text-blue-500 underline">
              JakeCleansCars.com
            </h2>
          </a>
        </motion.section>
      </div>
    </div>
  );
};

export default OurWork;
