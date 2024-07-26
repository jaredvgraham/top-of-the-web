"use client";

import React, { useState } from "react";
import Link from "next/link";
import { axiosPublic } from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";
import { set } from "mongoose";
import { useRouter } from "next/navigation";

const Login: React.FC = () => {
  const Router = useRouter();
  const [email, setEmail] = useState<string>("");

  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const { setAccessToken, setRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axiosPublic.post("/auth/login", {
        email,
        password,
      });
      console.log(response.data);

      setAccessToken(response.data.accessToken);

      setRole(response.data.userPayload.role);
      if (response.data.userPayload.role === "admin") {
        Router.push("/admin/blogform");
      } else if (response.data.userPayload.role === "user") {
        Router.push("/user/dashboard");
      }
    } catch (error) {
      setMessage("An error occurred during login.");
    }
  };

  return (
    <div id="login" className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Login</h1>
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
            Login
          </button>
          <Link
            href="/signup"
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Sign Up
          </Link>
        </div>
      </form>
      {message && <p className="text-center mt-5 text-red-500">{message}</p>}
    </div>
  );
};

export default Login;
