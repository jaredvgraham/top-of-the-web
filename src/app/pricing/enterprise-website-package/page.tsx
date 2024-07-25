import React from "react";
import { BiDollar } from "react-icons/bi";
import {
  FaGlobe,
  FaFileAlt,
  FaSearch,
  FaEnvelope,
  FaServer,
  FaChartBar,
  FaShareAlt,
  FaShoppingCart,
  FaHandsHelping,
  FaCogs,
  FaStar,
  FaShieldAlt,
  FaCode,
  FaSync,
} from "react-icons/fa";

const pricingModels = [
  {
    label: "One-Time Payment",
    url: "https://buy.stripe.com/test_4gwcQxcWJ1lggKsaEE",
  },
  {
    label: "Monthly Payment",
    url: "https://buy.stripe.com/test_5kA03L5uh8NIdyg7st",
  },
];

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-800">
          Enterprise Website Package
        </h1>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Tailored Solutions for Your Business
          </h2>
          <p className="text-lg mb-6 text-gray-600">
            Our Enterprise Website Package is designed for large-scale projects
            requiring advanced features and custom solutions. Get a website
            tailored to your specific business needs, with comprehensive
            integration and top-notch support.
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 mb-8 shadow-inner">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            What&apos;s Included:
          </h3>
          <ul className="list-none space-y-4 text-gray-600">
            <li className="flex items-center">
              <FaCogs className="text-blue-500 mr-2" /> Custom pricing based on
              project scope
            </li>
            <li className="flex items-center">
              <FaGlobe className="text-green-500 mr-2" /> Custom website design
              and development
            </li>
            <li className="flex items-center">
              <FaServer className="text-purple-500 mr-2" /> Comprehensive
              backend integration with multiple APIs
            </li>
            <li className="flex items-center">
              <FaShieldAlt className="text-red-500 mr-2" /> Advanced security
              features
            </li>
            <li className="flex items-center">
              <FaChartBar className="text-orange-500 mr-2" /> Custom analytics
              dashboards
            </li>
            <li className="flex items-center">
              <FaSync className="text-pink-500 mr-2" /> Ongoing maintenance and
              support
            </li>
            <li className="flex items-center">
              <FaChartBar className="text-yellow-500 mr-2" /> Regular
              performance reviews and optimization
            </li>
            <li className="flex items-center">
              <FaCode className="text-teal-500 mr-2" /> Custom development
              solutions
            </li>
            <li className="flex items-center">
              <FaSearch className="text-blue-500 mr-2" /> Advanced SEO setup
            </li>
            <li className="flex items-center">
              <FaEnvelope className="text-indigo-500 mr-2" /> Custom contact
              forms
            </li>
            <li className="flex items-center">
              <FaShoppingCart className="text-yellow-600 mr-2" /> E-commerce
              functionality
            </li>
            <li className="flex items-center">
              <FaShareAlt className="text-indigo-600 mr-2" /> Social media
              integration
            </li>
            <li className="flex items-center">
              <FaCogs className="text-blue-600 mr-2" /> Custom solutions for
              specific business needs
            </li>
            <li className="flex items-center">
              <FaFileAlt className="text-green-600 mr-2" /> Up to 50 pages
            </li>
            <li className="flex items-center">
              <FaStar className="text-indigo-600 mr-2" /> Priority support
            </li>
          </ul>
        </div>
        <p className="text-xl font-semibold mb-8 text-center text-gray-700">
          Price: $10,000+
        </p>
        <p className="text-base mb-10 text-gray-600 text-center">
          Choose the payment option that best suits your needs and get started
          on creating a comprehensive and tailored website solution today!
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {pricingModels.map((model) => (
            <a
              key={model.label}
              href={model.url}
              className="bg-black text-gray-200 rounded-lg shadow-md px-8 py-4 text-center transform transition-transform hover:shadow-lg hover:scale-105"
            >
              <h2 className="text-xl font-bold mb-1">{model.label}</h2>
              <p className="text-base flex items-center justify-center gap-2">
                <BiDollar className="text-2xl text-yellow-400" />
                Click to Pay
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
