"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaGlobe,
  FaFileAlt,
  FaSearch,
  FaEnvelope,
  FaServer,
  FaBlog,
  FaChartBar,
  FaShareAlt,
  FaHandsHelping,
  FaCogs,
  FaStar,
  FaShoppingCart,
  FaShieldAlt,
  FaSync,
  FaCode,
} from "react-icons/fa";

const packages = [
  {
    title: "Starter Website Package",
    price: "$800",
    features: [
      {
        icon: FaGlobe,
        text: "Beautiful website design",
        color: "text-blue-500",
      },
      { icon: FaFileAlt, text: "Up to 4 pages", color: "text-green-500" },
      { icon: FaSearch, text: "Basic SEO setup", color: "text-purple-500" },
      { icon: FaEnvelope, text: "Contact form", color: "text-red-500" },
    ],
  },
  {
    title: "Standard Website Package",
    price: "$1,400",
    features: [
      { icon: FaGlobe, text: "Custom website design", color: "text-blue-500" },
      { icon: FaFileAlt, text: "Up to 7 pages", color: "text-green-500" },
      { icon: FaSearch, text: "SEO optimization", color: "text-purple-500" },
      { icon: FaEnvelope, text: "Contact form", color: "text-red-500" },
      {
        icon: FaServer,
        text: "Backend integration for emails and phone call notifications",
        color: "text-orange-500",
      },
      { icon: FaBlog, text: "Blog setup", color: "text-pink-500" },
      {
        icon: FaChartBar,
        text: "Basic analytics integration",
        color: "text-yellow-500",
      },
      {
        icon: FaShareAlt,
        text: "Social media integration",
        color: "text-teal-500",
      },
      {
        icon: FaHandsHelping,
        text: "Enhanced support and maintenance",
        color: "text-indigo-500",
      },
    ],
  },
  {
    title: "Advanced Website Package",
    price: "$3,000",
    features: [
      { icon: FaGlobe, text: "Custom website design", color: "text-blue-500" },
      { icon: FaFileAlt, text: "Up to 15 pages", color: "text-green-500" },
      { icon: FaSearch, text: "Advanced SEO setup", color: "text-purple-500" },
      { icon: FaEnvelope, text: "Custom contact forms", color: "text-red-500" },
      {
        icon: FaServer,
        text: "Backend integration for emails and phone call notifications",
        color: "text-orange-500",
      },
      { icon: FaBlog, text: "Blog setup", color: "text-pink-500" },
      {
        icon: FaChartBar,
        text: "Advanced analytics integration",
        color: "text-yellow-500",
      },
      { icon: FaCogs, text: "Custom CRM integration", color: "text-teal-500" },
      {
        icon: FaShoppingCart,
        text: "E-commerce functionality",
        color: "text-blue-500",
      },
      {
        icon: FaShareAlt,
        text: "Social media integration",
        color: "text-indigo-500",
      },
      {
        icon: FaChartBar,
        text: "Monthly performance reviews",
        color: "text-yellow-600",
      },
      { icon: FaStar, text: "Priority support", color: "text-indigo-600" },
    ],
  },
  {
    title: "E-commerce Website Package",
    price: "$5,000",
    features: [
      {
        icon: FaShoppingCart,
        text: "Custom e-commerce site with up to 50 products",
        color: "text-blue-500",
      },
      {
        icon: FaCogs,
        text: "Payment gateway integration",
        color: "text-green-500",
      },
      {
        icon: FaChartBar,
        text: "Inventory management system",
        color: "text-purple-500",
      },
      {
        icon: FaChartBar,
        text: "Advanced analytics and reporting",
        color: "text-red-500",
      },
      {
        icon: FaEnvelope,
        text: "Email marketing integration",
        color: "text-orange-500",
      },
      {
        icon: FaShoppingCart,
        text: "Abandoned cart recovery",
        color: "text-pink-500",
      },
      {
        icon: FaStar,
        text: "Customer reviews and ratings",
        color: "text-yellow-500",
      },
      { icon: FaGlobe, text: "Custom website design", color: "text-teal-500" },
      { icon: FaSearch, text: "Advanced SEO setup", color: "text-blue-500" },
      {
        icon: FaEnvelope,
        text: "Custom contact forms",
        color: "text-indigo-500",
      },
    ],
  },
  {
    title: "Enterprise Website Package",
    price: "$10,000+",
    features: [
      {
        icon: FaCogs,
        text: "Custom pricing based on project scope",
        color: "text-blue-500",
      },
      {
        icon: FaGlobe,
        text: "Custom website design and development",
        color: "text-green-500",
      },
      {
        icon: FaServer,
        text: "Comprehensive backend integration with multiple APIs",
        color: "text-purple-500",
      },
      {
        icon: FaShieldAlt,
        text: "Advanced security features",
        color: "text-red-500",
      },
      {
        icon: FaChartBar,
        text: "Custom analytics dashboards",
        color: "text-orange-500",
      },
      {
        icon: FaSync,
        text: "Ongoing maintenance and support",
        color: "text-pink-500",
      },
      {
        icon: FaChartBar,
        text: "Regular performance reviews and optimization",
        color: "text-yellow-500",
      },
      {
        icon: FaCode,
        text: "Custom development solutions",
        color: "text-teal-500",
      },
      { icon: FaSearch, text: "Advanced SEO setup", color: "text-blue-500" },
      {
        icon: FaEnvelope,
        text: "Custom contact forms",
        color: "text-indigo-500",
      },
      {
        icon: FaShoppingCart,
        text: "E-commerce functionality",
        color: "text-yellow-600",
      },
      {
        icon: FaShareAlt,
        text: "Social media integration",
        color: "text-indigo-600",
      },
      {
        icon: FaCogs,
        text: "Custom solutions for specific business needs",
        color: "text-blue-600",
      },
      { icon: FaFileAlt, text: "Up to 50 pages", color: "text-green-600" },
      { icon: FaStar, text: "Priority support", color: "text-indigo-600" },
    ],
  },
];

const Pricing = () => {
  const Router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const route = (name: string | undefined) => {
    if (!name) return "";
    return name.split(" ").join("-").toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 p-2 md:p-10">
      <h1 className=" text-4xl md:text-6xl font-extrabold text-center m-5 text-gray-800">
        Website Pricing
      </h1>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 "
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {packages.map((pkg) => (
          <motion.div
            onClick={() => Router.push(`/pricing/${route(pkg.title)}`)}
            key={pkg.title}
            className={`relative p-7 cursor-pointer  rounded-lg shadow-lg transform transition-transform bg-white hover:shadow-2xl ${
              pkg.title === "Standard Website Package"
                ? "border-4 gradient-border scale-105 "
                : ""
            }`}
            variants={itemVariants}
          >
            {pkg.title === "Standard Website Package" && (
              <div className="absolute top-0 right-0 gradient-bg text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                Most Popular
              </div>
            )}
            <div className="bg-gradient-to-r from-gray-400 to-gray-600 p-4 rounded-t-lg">
              <h2 className="text-4xl font-bold mb-4 text-white text-center">
                {pkg.title}
              </h2>
              <p className="text-3xl font-semibold mb-6 text-white text-center">
                {pkg.price}
              </p>
            </div>
            <ul className="list-none pl-1 space-y-3 p-4 text-gray-700">
              {pkg.features.map((feature) => (
                <li key={feature.text} className="flex items-center">
                  <feature.icon className={`${feature.color} mr-2`} />
                  {feature.text}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Pricing;
