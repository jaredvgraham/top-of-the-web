import React from "react";
import { BiDollar } from "react-icons/bi";
import { FaGlobe, FaFileAlt, FaSearch, FaEnvelope } from "react-icons/fa";

const pricingModels = [
  {
    label: "One-Time Payment",
    url: "https://buy.stripe.com/28odTL2XqgTV0ScbII",
  },
  {
    label: "Monthly Payment",
    url: "https://buy.stripe.com/8wM6rj2Xq5bd7gA5kl",
  },
];

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-800">
          Starter Website Package
        </h1>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Transform Your Online Presence
          </h2>
          <p className="text-lg mb-6 text-gray-600">
            Our Starter Website Package is perfect for small businesses,
            startups, and personal projects. Get a professionally designed
            website that sets you apart from the competition and attracts more
            customers.
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 mb-8 shadow-inner">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            What&apos;s Included:
          </h3>
          <ul className="list-none space-y-4 text-gray-600">
            <li className="flex items-center">
              <FaGlobe className="text-blue-500 mr-2" /> Beautiful website
              design
            </li>
            <li className="flex items-center">
              <FaFileAlt className="text-green-500 mr-2" /> Up to 4 pages
            </li>
            <li className="flex items-center">
              <FaSearch className="text-purple-500 mr-2" /> Basic SEO setup
            </li>
            <li className="flex items-center">
              <FaEnvelope className="text-red-500 mr-2" /> Contact form
            </li>
          </ul>
        </div>
        <p className="text-xl font-semibold mb-8 text-center text-gray-700">
          Price: $800
        </p>
        <p className="text-base mb-10 text-gray-600 text-center">
          Choose the payment option that best suits your needs and get started
          on creating a stunning website today!
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {pricingModels.map((model) => (
            <a
              key={model.label}
              href={model.url}
              className="bg-black text-gray-300 rounded-lg shadow-md px-8 py-4 text-center transform transition-transform hover:shadow-lg hover:scale-105"
            >
              <h2 className="text-xl font-bold mb-1">{model.label}</h2>
              <p className="text-base flex items-center justify-center mr-3">
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
