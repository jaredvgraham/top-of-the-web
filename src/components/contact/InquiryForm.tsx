"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const inputClasses =
  "w-full border-0 border-b border-ink/20 bg-transparent px-0 py-4 text-lg text-ink placeholder:text-ink/30 outline-none transition-colors focus:border-accent focus:ring-0";

const InquiryForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry: "",
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      const response = await axios.post("/api/inquiry", formData);
      const onboardingUrl =
        typeof response.data?.onboardingUrl === "string"
          ? response.data.onboardingUrl
          : "";
      const token =
        typeof response.data?.token === "string" ? response.data.token : "";

      if (response.status === 200 && (onboardingUrl || token)) {
        setResponseMessage("Got it — taking you to your site brief…");
        router.push(onboardingUrl || `/onboarding/${token}`);
        return;
      }

      setResponseMessage("Error submitting inquiry. Please try again.");
      setError(true);
    } catch {
      setResponseMessage("Error submitting inquiry. Please try again.");
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.2 }}
      className="rounded-3xl border border-ink/15 bg-paper p-8 sm:p-12"
    >
      <p className="mb-10 text-[12px] font-semibold uppercase tracking-[0.24em] text-ink/50">
        Send us a message
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label
            className="mb-1 block text-[13px] font-medium uppercase tracking-[0.16em] text-ink/50"
            htmlFor="name"
          >
            Full Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClasses}
            required
            placeholder="Jane Doe"
          />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <label
              className="mb-1 block text-[13px] font-medium uppercase tracking-[0.16em] text-ink/50"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              className="mb-1 block text-[13px] font-medium uppercase tracking-[0.16em] text-ink/50"
              htmlFor="phone"
            >
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClasses}
              required
              placeholder="(123) 456-7890"
            />
          </div>
        </div>
        <div>
          <label
            className="mb-1 block text-[13px] font-medium uppercase tracking-[0.16em] text-ink/50"
            htmlFor="inquiry"
          >
            What should your website help you sell?
          </label>
          <textarea
            name="inquiry"
            id="inquiry"
            value={formData.inquiry}
            onChange={handleChange}
            className={`${inputClasses} resize-none`}
            required
            rows={4}
            placeholder="Tell us about your business, current website, and ideal customers..."
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="group relative w-full overflow-hidden rounded-full bg-ink px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-60"
        >
          <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
          <span className="relative">
            {submitting ? "Sending..." : "Send Message"}
          </span>
        </button>
        <p className="text-center text-sm text-ink/45">
          After you send, we’ll take you to a short site brief so we can start
          building.
        </p>
        {responseMessage && (
          <p
            className={`text-center text-sm font-medium ${
              error ? "text-red-600" : "text-accent"
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
