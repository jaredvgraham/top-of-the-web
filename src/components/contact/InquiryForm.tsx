"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const InquiryForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry: "",
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResponseMessage("");
    setError(false);
    try {
      const response = await axios.post("/api/inquiry", formData);
      if (response.status === 200) {
        setResponseMessage("Inquiry submitted successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          inquiry: "",
        });
      } else {
        setResponseMessage("Error submitting inquiry. Please try again.");
        setError(true);
      }
    } catch (error) {
      setResponseMessage("Error submitting inquiry. Please try again.");
      setError(true);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Send Us a Message
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            className="block text-gray-600 text-sm font-semibold mb-2"
            htmlFor="name"
          >
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            required
            placeholder="John Doe"
          />
        </div>
        <div>
          <label
            className="block text-gray-600 text-sm font-semibold mb-2"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            required
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            className="block text-gray-600 text-sm font-semibold mb-2"
            htmlFor="phone"
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            required
            placeholder="(123) 456-7890"
          />
        </div>
        <div>
          <label
            className="block text-gray-600 text-sm font-semibold mb-2"
            htmlFor="inquiry"
          >
            How can we help?
          </label>
          <textarea
            name="inquiry"
            value={formData.inquiry}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            required
            rows={4}
            placeholder="Tell us about your project or question..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Send Inquiry
        </button>
        {responseMessage && (
          <p
            className={`mt-4 text-center text-sm ${
              error ? "text-red-500" : "text-green-500"
            }`}
          >
            {responseMessage}
          </p>
        )}
      </form>
    </motion.div>
  );
};

export default InquiryForm;
