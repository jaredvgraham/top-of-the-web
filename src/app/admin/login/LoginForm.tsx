"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
        return;
      }

      const from = searchParams.get("from") || "/admin";
      router.replace(from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain relative min-h-[100dvh] overflow-hidden bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(91,46,158,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(31,182,214,0.12), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-ink/45">
            Bsites
          </p>
          <h1 className="font-display text-5xl font-medium tracking-tight text-ink sm:text-6xl">
            Admin
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-[380px] border border-ink/10 bg-white/80 p-8 backdrop-blur-sm sm:p-10"
        >
          <p className="mb-8 text-sm leading-relaxed text-ink/55">
            Enter the admin password to manage websites and customers.
          </p>

          <label
            htmlFor="password"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-ink/50"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full border-b border-ink/25 bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-accent"
            placeholder="••••••••"
            autoFocus
            required
          />

          {error && (
            <p className="mb-5 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-55"
          >
            <span className="relative z-10">
              {loading ? "Signing in…" : "Sign in"}
            </span>
          </button>
        </motion.form>
      </div>
    </div>
  );
}
