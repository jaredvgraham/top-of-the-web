"use client";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import React, { useState } from "react";

const WebsiteChange = () => {
  const axiosPrivate = useAxiosPrivate();
  const [formData, setFormData] = useState({
    section: "",
    change: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    try {
      const res = await axiosPrivate.post("/user/website/change", formData);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Website Change</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="section"
            className="block text-lg font-medium text-gray-700"
          >
            Section
          </label>
          <input
            type="text"
            id="section"
            name="section"
            value={formData.section}
            onChange={(e) =>
              setFormData({ ...formData, section: e.target.value })
            }
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="change"
            className="block text-lg font-medium text-gray-700"
          >
            Change
          </label>
          <input
            type="text"
            id="change"
            name="change"
            value={formData.change}
            onChange={(e) =>
              setFormData({ ...formData, change: e.target.value })
            }
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default WebsiteChange;
