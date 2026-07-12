"use client";

import React, { useState } from "react";
import axios from "axios";

const BlogForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/blog", { title, content });
      setMessage("Blog post created successfully!");
      setTitle("");
      setContent("");
    } catch {
      setMessage("Failed to create blog post.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/45">
        Content
      </p>
      <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        Create a blog post
      </h1>
      {message ? (
        <p className="mt-4 text-sm text-accent">{message}</p>
      ) : null}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b border-ink/20 bg-transparent py-3 text-base outline-none focus:border-accent"
            required
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full resize-y border border-ink/15 bg-transparent p-4 text-base outline-none focus:border-accent"
            rows={12}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-paper sm:w-auto"
        >
          Create post
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
