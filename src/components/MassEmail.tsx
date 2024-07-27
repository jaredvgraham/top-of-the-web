"use client";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

import React, { useState } from "react";

export const MassEmail = () => {
  const axiosPrivate = useAxiosPrivate();
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("send email", formData);
    try {
      const response = await axiosPrivate.post("/email", formData);
      console.log("response", response);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div>
      <h1>Mass Email</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
