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
    price: "$299",
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
    price: "$999",
    features: [
      { icon: FaGlobe, text: "Custom website design", color: "text-blue-500" },
      { icon: FaFileAlt, text: "Up to 7 pages", color: "text-green-500" },
      { icon: FaSearch, text: "SEO optimization", color: "text-purple-500" },
      { icon: FaEnvelope, text: "Contact form", color: "text-red-500" },
      {
        icon: FaServer,
        text: "Backend integration for email marketing, review campaigns, and more",
        color: "text-orange-500",
      },
      { icon: FaBlog, text: "Blog setup", color: "text-pink-500" },
      {
        icon: FaChartBar,
        text: "Basic analytics integration",
        color: "text-yellow-500",
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
    price: "$2999",
    features: [
      { icon: FaGlobe, text: "Custom website design", color: "text-blue-500" },
      { icon: FaFileAlt, text: "Up to 15 pages", color: "text-green-500" },
      { icon: FaSearch, text: "Advanced SEO setup", color: "text-purple-500" },
      { icon: FaEnvelope, text: "Custom contact forms", color: "text-red-500" },
      {
        icon: FaServer,
        text: "Backend integration for customer collection, email marketing, review campaigns, and more",
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
        icon: FaChartBar,
        text: "Monthly performance reviews",
        color: "text-yellow-600",
      },
      { icon: FaStar, text: "Priority support", color: "text-indigo-600" },
    ],
  },
  // {
  //   title: "Enterprise Website Package",
  //   price: "$10,000+",
  //   features: [
  //     {
  //       icon: FaCogs,
  //       text: "Custom pricing based on project scope",
  //       color: "text-blue-500",
  //     },
  //     {
  //       icon: FaGlobe,
  //       text: "Custom website design and development",
  //       color: "text-green-500",
  //     },
  //     {
  //       icon: FaServer,
  //       text: "Comprehensive backend integration with multiple APIs",
  //       color: "text-purple-500",
  //     },
  //     {
  //       icon: FaShieldAlt,
  //       text: "Advanced security features",
  //       color: "text-red-500",
  //     },
  //     {
  //       icon: FaChartBar,
  //       text: "Custom analytics dashboards",
  //       color: "text-orange-500",
  //     },
  //     {
  //       icon: FaSync,
  //       text: "Ongoing maintenance and support",
  //       color: "text-pink-500",
  //     },
  //     {
  //       icon: FaChartBar,
  //       text: "Regular performance reviews and optimization",
  //       color: "text-yellow-500",
  //     },
  //     {
  //       icon: FaCode,
  //       text: "Custom development solutions",
  //       color: "text-teal-500",
  //     },
  //     { icon: FaSearch, text: "Advanced SEO setup", color: "text-blue-500" },
  //     {
  //       icon: FaEnvelope,
  //       text: "Custom contact forms",
  //       color: "text-indigo-500",
  //     },
  //     {
  //       icon: FaShoppingCart,
  //       text: "E-commerce functionality",
  //       color: "text-yellow-600",
  //     },
  //     {
  //       icon: FaShareAlt,
  //       text: "Social media integration",
  //       color: "text-indigo-600",
  //     },
  //     {
  //       icon: FaCogs,
  //       text: "Custom solutions for specific business needs",
  //       color: "text-blue-600",
  //     },
  //     { icon: FaFileAlt, text: "Up to 50 pages", color: "text-green-600" },
  //     { icon: FaStar, text: "Priority support", color: "text-indigo-600" },
  //   ],
  // },
  // {
  //   title: "E-commerce Website Package",
  //   price: "$5,000",
  //   features: [
  //     {
  //       icon: FaShoppingCart,
  //       text: "Custom e-commerce site with up to 50 products",
  //       color: "text-blue-500",
  //     },
  //     {
  //       icon: FaCogs,
  //       text: "Payment gateway integration",
  //       color: "text-green-500",
  //     },
  //     {
  //       icon: FaChartBar,
  //       text: "Inventory management system",
  //       color: "text-purple-500",
  //     },
  //     {
  //       icon: FaChartBar,
  //       text: "Advanced analytics and reporting",
  //       color: "text-red-500",
  //     },
  //     {
  //       icon: FaEnvelope,
  //       text: "Email marketing integration",
  //       color: "text-orange-500",
  //     },
  //     {
  //       icon: FaShoppingCart,
  //       text: "Abandoned cart recovery",
  //       color: "text-pink-500",
  //     },
  //     {
  //       icon: FaStar,
  //       text: "Customer reviews and ratings",
  //       color: "text-yellow-500",
  //     },
  //     { icon: FaGlobe, text: "Custom website design", color: "text-teal-500" },
  //     { icon: FaSearch, text: "Advanced SEO setup", color: "text-blue-500" },
  //     {
  //       icon: FaEnvelope,
  //       text: "Custom contact forms",
  //       color: "text-indigo-500",
  //     },
  //   ],
  // },
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
    <div className="min-h-screen bg-gray-50 p-8 md:p-16 overflow-hidden">
      <h1 className="text-5xl md:text-7xl font-extrabold text-center mb-20 text-gray-800">
        Flexible Pricing for Every Need
      </h1>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {packages.map((pkg) => (
          <motion.div
            key={pkg.title}
            className={`rounded-2xl shadow-lg transition-all duration-300 hover:shadow-blue-500/20 hover:scale-105 ${
              pkg.title === "Standard Website Package"
                ? "ring-2 ring-blue-500"
                : "bg-white"
            }`}
            variants={itemVariants}
          >
            <div className="rounded-2xl p-8 h-full flex flex-col border border-gray-200">
              <div className="flex-grow">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2 text-gray-900">
                    {pkg.title}
                  </h2>
                  {pkg.title === "Standard Website Package" && (
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                      Most Popular
                    </p>
                  )}
                </div>

                <div className="text-center mb-8 border-b pb-8">
                  <span className="text-5xl font-bold text-gray-900">
                    {pkg.price}
                  </span>
                  <span className="text-gray-500 text-lg">/one-time</span>
                </div>

                <ul className="space-y-4 text-gray-700 my-8">
                  {pkg.features.map((feature) => (
                    <li key={feature.text} className="flex items-start">
                      <feature.icon
                        className={`${feature.color} mr-3 mt-1 flex-shrink-0`}
                      />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => Router.push(`/pricing/${route(pkg.title)}`)}
                className={`w-full mt-auto py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                  pkg.title === "Standard Website Package"
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                    : "bg-white text-blue-600 ring-1 ring-blue-200 hover:bg-blue-50"
                }`}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Pricing;
