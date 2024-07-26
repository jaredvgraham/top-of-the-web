"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

interface BlogPost {
  _id: string;
  title: string;
  content: string;
}

const BlogComp: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("/api/blog");
        if (response.data.success) {
          setBlogs(response.data.data);
        } else {
          setError(response.data.error);
        }
      } catch (error) {
        setError("An error occurred while fetching blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );

  return (
    <div
      id="blog"
      className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 p-2 md:p-10"
    >
      <h1 className="text-4xl md:text-6xl font-extrabold text-center m-5 text-gray-800">
        Blog Posts
      </h1>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {blogs &&
          blogs.map((blog) => (
            <motion.div
              key={blog._id}
              className="relative p-7 cursor-pointer rounded-lg shadow-lg transform transition-transform bg-white hover:shadow-2xl"
              variants={itemVariants}
            >
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 p-4 rounded-t-lg">
                <h2 className="text-4xl font-bold mb-4 text-white text-center">
                  {blog.title}
                </h2>
              </div>
              <div className="list-none pl-1 space-y-3 p-4 text-gray-700">
                <p>{blog.content}</p>
              </div>
            </motion.div>
          ))}
      </motion.div>
    </div>
  );
};

export default BlogComp;
