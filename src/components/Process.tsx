"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaLightbulb,
  FaDraftingCompass,
  FaCode,
  FaCogs,
  FaRocket,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaLightbulb />,
    color: "text-yellow-500",
    title: "Ideation",
    description:
      "We brainstorm and gather requirements to understand your needs and vision. This includes market research, competitor analysis, and outlining the project scope.",
  },
  {
    icon: <FaDraftingCompass />,
    color: "text-gray-700",
    title: "Planning",
    description:
      "We create a detailed plan and wireframes to visualize the project structure. This step involves defining the sitemap, user flow, and initial design sketches.",
  },
  {
    icon: <FaCode />,
    color: "text-blue-500",
    title: "Development",
    description:
      "We start coding and bringing your project to life with best practices. Our development process includes both frontend and backend work, ensuring a seamless user experience.",
  },
  {
    icon: <FaCogs />,
    color: "text-orange-500",
    title: "Testing",
    description:
      "We rigorously test the project to ensure it meets all requirements and is bug-free. This phase includes unit testing, integration testing, and user acceptance testing.",
  },
  {
    icon: <FaRocket />,
    color: "text-green-500",
    title: "Launch",
    description:
      "We deploy the project and make it live for the world to see. Post-launch, we offer support and maintenance to ensure your website runs smoothly.",
  },
];

const Process = () => {
  return (
    <div className="relative py-16 ">
      <div className="absolute top-0 left-0 w-full h-full bg-pattern opacity-10 pointer-events-none"></div>
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-5xl font-extrabold mb-16 text-gray-800">
          Our Process
        </h2>
        <div className="relative">
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="w-full h-1 bg-gray-300"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative p-8 bg-white rounded-lg shadow-lg flex flex-col items-center transition-transform duration-500 hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: index * 0.2,
                }}
              >
                <div
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md ${step.color}`}
                >
                  <div className="text-3xl">{step.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Process;
