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
    hidden: { opacity: 0, y: 20 },
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
    <div id="blog" className="min-h-screen bg-gray-100 p-4 md:p-8">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-gray-900">
        Blog Posts
      </h1>
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {blogs &&
          blogs.map((blog) => (
            <motion.div
              key={blog._id}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {blog.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">{blog.content}</p>
            </motion.div>
          ))}
      </motion.div>
    </div>
  );
};

export default BlogComp;
