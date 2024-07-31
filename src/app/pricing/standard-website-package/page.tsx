"use client";
import { axiosPublic } from "@/utils/axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { BiDollar } from "react-icons/bi";
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
} from "react-icons/fa";

const Page = () => {
  const Router = useRouter();
  const [websitePackage, setWebsitePackage] = useState("");
  const [paymentModel, setPaymentModel] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const pricingModels = [
    {
      label: "One-Time Payment",
      package: "Standard Website Package",
    },
    {
      label: "Monthly Payment",
      package: "Standard Website Package",
    },
  ];

  const handleForm = (websitePackage: string, paymentModel: string) => {
    setWebsitePackage(websitePackage);
    setPaymentModel(paymentModel);
    setShowForm(true);
  };

  const handlePayment = async (
    websitePackage: string,
    paymentModel: string,
    email: string
  ) => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    if (paymentModel === "One-Time Payment") {
      const response = await axiosPublic.post("/stripe/one-time", {
        email,
        pack: websitePackage,
      });
      console.log(response.data.url);
      Router.push(response.data.url);
    } else {
      const response = await axiosPublic.post("/stripe/subscription", {
        email,
        pack: websitePackage,
      });
      console.log(response.data.url);
      Router.push(response.data.url);
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-800">
            Starter Website Package
          </h1>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              {paymentModel}
            </h2>
            <p className="text-lg mb-6 text-gray-600">
              Please enter your email address to proceed with the payment.
            </p>
          </div>
          <form
            className="bg-gray-50 rounded-lg p-6 mb-8 shadow-inner"
            onSubmit={(e) => {
              e.preventDefault();
              handlePayment(websitePackage, paymentModel, email);
            }}
          >
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Email Address
            </label>

            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 mb-4 focus:outline-none focus:ring focus:border-blue-300"
              required
            />
            <button
              type="submit"
              className="bg-black text-gray-300 rounded-lg shadow-md px-8 py-4 text-center transform transition-transform hover:shadow-lg hover:scale-105 mt-4"
            >
              <h2 className="text-xl font-bold mb-1">Proceed</h2>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-800">
          Standard Website Package
        </h1>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Elevate Your Online Presence
          </h2>
          <p className="text-lg mb-6 text-gray-600">
            Our Standard Website Package offers a comprehensive solution for
            businesses that need more features and customization. Get a custom
            website designed to meet your specific needs and attract more
            customers.
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 mb-8 shadow-inner">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            What&apos;s Included:
          </h3>
          <ul className="list-none space-y-4 text-gray-600">
            <li className="flex items-center">
              <FaGlobe className="text-blue-500 mr-2" /> Custom website design
            </li>
            <li className="flex items-center">
              <FaFileAlt className="text-green-500 mr-2" /> Up to 7 pages
            </li>
            <li className="flex items-center">
              <FaSearch className="text-purple-500 mr-2" /> SEO optimization
            </li>
            <li className="flex items-center">
              <FaEnvelope className="text-red-500 mr-2" /> Contact form
            </li>
            <li className="flex items-center">
              <FaServer className="text-orange-500 mr-2" /> Backend integration
              for emails and phone call notifications
            </li>
            <li className="flex items-center">
              <FaBlog className="text-pink-500 mr-2" /> Blog setup
            </li>
            <li className="flex items-center">
              <FaChartBar className="text-yellow-500 mr-2" /> Basic analytics
              integration
            </li>
            <li className="flex items-center">
              <FaShareAlt className="text-teal-500 mr-2" /> Social media
              integration
            </li>
            <li className="flex items-center">
              <FaHandsHelping className="text-indigo-500 mr-2" /> Enhanced
              support and maintenance
            </li>
          </ul>
        </div>
        <p className="text-xl font-semibold mb-8 text-center text-gray-700">
          Price: $1,400
        </p>
        <p className="text-base mb-10 text-gray-600 text-center">
          Choose the payment option that best suits your needs and get started
          on creating an impactful website today!
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {pricingModels.map((model) => (
            <button
              key={model.label}
              className="bg-black text-gray-200 rounded-lg shadow-md px-8 py-4 text-center transform transition-transform hover:shadow-lg hover:scale-105"
              onClick={() => handleForm(model.package, model.label)}
            >
              <h2 className="text-xl font-bold mb-1">{model.label}</h2>
              <p className="text-base flex items-center justify-center gap-2">
                <BiDollar className="text-2xl text-yellow-400" />
                Click to Pay
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
