"use client";

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const BlogForm: React.FC = () => {
  const { logout } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [success, setSuccess] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      const response = await axiosPrivate.post("/blog", {
        title,
        content,
      });
      if (response.data.success) {
        setSuccess("Blog created successfully");
        setTitle(""); // Clear the title input
        setContent(""); // Clear the content input
      } else {
        setSuccess("Error creating blog");
      }
    } catch (error) {
      setSuccess("Error creating blog");
    }
  };

  return (
    <div id="blogform" className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Create a New Blog Post</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Blog Title"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="content"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Blog Content"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
      </form>
      <button onClick={logout} className="text-red-500">
        Logout
      </button>
      {success && <p className="text-green-500 text-center mt-5">{success}</p>}
    </div>
  );
};

export default BlogForm;
