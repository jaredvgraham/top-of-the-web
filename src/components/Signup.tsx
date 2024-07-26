"use client";

import React, { useState } from "react";
import { axiosPublic } from "@/utils/axios";
import Link from "next/link";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axiosPublic.post("/auth/signup", {
        email,
        password,
      });

      if (response.data.success) {
        setMessage("Signup successful!");
        // Optionally, redirect to another page or handle success
      } else {
        setMessage("Signup failed: " + response.data.error);
      }
    } catch (error) {
      setMessage("An error occurred during signup.");
    }
  };

  return (
    <div id="signup" className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Signup</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Email"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Password"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Signup
          </button>
          <Link
            href="/login"
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Login
          </Link>
        </div>
      </form>
      {message && <p className="text-center mt-5 text-red-500">{message}</p>}
    </div>
  );
};

export default Signup;
