"use client";

import React from "react";
import { motion } from "framer-motion";

const packages = [
  {
    title: "Starter Website Package",
    price: "$800",
    features: [
      "Simple website with up to 5 pages",
      "Responsive design",
      "Basic SEO setup",
      "Contact form",
    ],
  },
  {
    title: "Standard Website Package",
    price: "$1,400",
    features: [
      "Responsive website design",
      "Up to 10 pages",
      "Basic SEO setup",
      "Contact form",
      "Backend integration for emails and phone call notifications",
      "Blog setup",
      "Basic analytics integration",
      "Enhanced support and maintenance",
    ],
  },
  {
    title: "Advanced Website Package",
    price: "$3,000",
    features: [
      "Custom website design",
      "Up to 20 pages",
      "Advanced SEO setup",
      "Custom contact forms",
      "Backend integration for emails and phone call notifications",
      "Blog setup",
      "Advanced analytics integration",
      "Custom CRM integration",
      "E-commerce functionality",
      "Social media integration",
      "Priority support",
    ],
  },
  {
    title: "E-commerce Website Package",
    price: "$5,000",
    features: [
      "Custom e-commerce site with up to 50 products",
      "Payment gateway integration",
      "Inventory management system",
      "Advanced analytics and reporting",
      "Email marketing integration",
      "Abandoned cart recovery",
      "Customer reviews and ratings",
      "Custom website design",
      "Advanced SEO setup",
      "Custom contact forms",
    ],
  },
  {
    title: "Enterprise Website Package",
    price: "$8,000",
    features: [
      "Custom website design and development",
      "Comprehensive backend integration with multiple APIs",
      "Advanced security features",
      "Custom analytics dashboards",
      "Ongoing maintenance and support",
      "Dedicated account manager",
      "Regular performance reviews and optimization",
      "Custom development solutions",
      "Advanced SEO setup",
      "Custom contact forms",
      "Up to 50 pages",
    ],
  },
];

const addOns = [
  {
    title: "SEO Optimization",
    price: "$500",
    features: [
      "Advanced keyword research",
      "On-page SEO optimization",
      "Monthly performance reports",
    ],
  },
  {
    title: "Content Management System (CMS)",
    price: "$600",
    features: [
      "Custom CMS setup",
      "Training sessions for staff",
      "Ongoing support",
    ],
  },
  {
    title: "Custom Analytics Dashboard",
    price: "$1,200",
    features: [
      "Custom analytics and reporting dashboards",
      "Integration with Google Analytics, Facebook Pixel, etc.",
      "Monthly performance reviews",
    ],
  },
  {
    title: "Mobile App Integration",
    price: "$2,500",
    features: [
      "Custom mobile app development for iOS and Android",
      "Integration with the website backend",
      "Push notifications and user analytics",
    ],
  },
  {
    title: "Marketing Automation",
    price: "$1,000",
    features: [
      "Email marketing setup and integration",
      "Automated workflows for lead nurturing",
      "Monthly performance analytics",
    ],
  },
  {
    title: "Branding Package",
    price: "$1,500",
    features: [
      "Custom logo design",
      "Business card and stationery design",
      "Social media branding and templates",
    ],
  },
  {
    title: "24/7 Support and Maintenance",
    price: "$100/month",
    features: [
      "24/7 technical support",
      "Regular website backups",
      "Monthly updates and security checks",
    ],
  },
];

const Pricing = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 p-2 md:p-10">
      <h1 className="text-6xl font-extrabold text-center mb-20 text-gray-800">
        Website Pricing
      </h1>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-12 "
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {packages.map((pkg) => (
          <motion.div
            key={pkg.title}
            className={`relative p-7  rounded-lg shadow-lg transform transition-transform bg-white hover:shadow-2xl ${
              pkg.title === "Standard Website Package"
                ? "border-4 gradient-border scale-105 "
                : ""
            }`}
            variants={itemVariants}
          >
            {pkg.title === "Standard Website Package" && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-400 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
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
            <ul className="list-disc pl-12 space-y-3 p-4 text-gray-700">
              {pkg.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
      <h2 className="text-5xl font-extrabold text-center my-20 text-gray-800">
        Add-On Services
      </h2>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {addOns.map((addon) => (
          <motion.div
            key={addon.title}
            className="p-6 rounded-lg shadow-lg transform transition-transform bg-white hover:shadow-2xl"
            variants={itemVariants}
          >
            <div className="bg-gradient-to-r from-gray-400 to-gray-600 p-4 rounded-t-lg">
              <h2 className="text-4xl font-bold mb-4 text-white text-center">
                {addon.title}
              </h2>
              <p className="text-3xl font-semibold mb-6 text-white text-center">
                {addon.price}
              </p>
            </div>
            <ul className="list-disc pl-12 space-y-3 p-4 text-gray-700">
              {addon.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Pricing;
