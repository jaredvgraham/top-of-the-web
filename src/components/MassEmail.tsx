"use client";

import React, { useState } from "react";

export const MassEmail = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending…");
    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Send failed");
      }
      setStatus("Sent");
      setFormData({ subject: "", message: "" });
    } catch {
      setStatus("Failed to send");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/45">
        Outreach
      </p>
      <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        Mass email
      </h1>
      {status ? <p className="mt-4 text-sm text-accent">{status}</p> : null}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="subject"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Subject
          </label>
          <input
            id="subject"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className="w-full border-b border-ink/20 bg-transparent py-3 text-base outline-none focus:border-accent"
            required
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full resize-y border border-ink/15 bg-transparent p-4 text-base outline-none focus:border-accent"
            rows={10}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-paper sm:w-auto"
        >
          Send
        </button>
      </form>
    </div>
  );
};
