"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaCode,
  FaPaintBrush,
  FaSearch,
  FaMobileAlt,
  FaBullhorn,
  FaShieldAlt,
} from "react-icons/fa";

type Service = {
  icon: JSX.Element;
  title: string;
  description: string;
  color: string;
  index: number;
};

const services = [
  {
    icon: <FaCode />,
    title: "Web Development",
    description:
      "High-quality, responsive websites tailored to your business needs.",
    color: "bg-blue-500",
  },
  {
    icon: <FaPaintBrush />,
    title: "Web Design",
    description: "Beautiful, user-friendly designs that enhance your brand.",
    color: "bg-green-500",
  },
  {
    icon: <FaSearch />,
    title: "SEO Optimization",
    description:
      "Optimize your website to rank higher in search engine results.",
    color: "bg-purple-500",
  },
  {
    icon: <FaMobileAlt />,
    title: "Mobile Development",
    description:
      "Cross-platform mobile applications to reach a wider audience.",
    color: "bg-pink-500",
  },
  {
    icon: <FaBullhorn />,
    title: "Digital Marketing",
    description:
      "Effective online marketing strategies to boost your business.",
    color: "bg-yellow-500",
  },
  {
    icon: <FaShieldAlt />,
    title: "Cyber Security",
    description:
      "Protect your online presence with advanced security solutions.",
    color: "bg-red-500",
  },
];

const ServiceItem = ({ icon, title, description, color, index }: Service) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      className={`p-8 m-4 rounded-lg shadow-lg ${color} text-white`}
      initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.2 }}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-white">{description}</p>
    </motion.div>
  );
};

const Services = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto text-center">
        <h2 className="text-5xl font-extrabold mb-12 text-gray-800">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceItem
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              color={service.color}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
