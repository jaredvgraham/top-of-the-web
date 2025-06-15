"use client";
import axios from "axios";
import React, { useState } from "react";

const WebsiteChange = () => {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post("/api/check-domain", { domain });
      setSuccess(true);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to check domain. Was it in the right format? example.com."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Check Domain Availability</h2>
      <div className="flex items-center">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="p-2 border rounded-l w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">Domain is available!</p>}
    </form>
  );
};

export default WebsiteChange;
