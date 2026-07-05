"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

type CheckoutButtonProps = {
  label?: string;
  className?: string;
  children?: React.ReactNode;
};

const CheckoutButton = ({ label, className, children }: CheckoutButtonProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const prefersFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersFinePointer) {
      inputRef.current?.focus({ preventScroll: true });
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const scrollInputIntoView = () => {
    window.requestAnimationFrame(() => {
      inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Something went wrong");
        return;
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch {
      setError("Unable to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children ?? label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/60 px-5 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          >
            <div className="flex min-h-[100dvh] items-start justify-center py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:items-center sm:py-10">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.3, ease }}
                className="relative my-auto w-full max-w-md shrink-0 rounded-3xl border border-ink/15 bg-paper p-6 shadow-2xl sm:p-8"
                onClick={(e) => e.stopPropagation()}
              >
              <button
                type="button"
                onClick={() => !loading && setOpen(false)}
                className="absolute right-6 top-6 text-ink/40 transition-colors hover:text-ink"
                aria-label="Close"
              >
                ✕
              </button>

              <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50">
                Secure checkout
              </p>
              <h2 className="font-display mb-2 text-3xl font-medium tracking-tight text-ink">
                Subscribe to the plan
              </h2>
              <p className="mb-8 text-[15px] leading-7 text-ink/60">
                Enter your email to continue to Stripe checkout. $0 build today,
                then $84/mo for hosting and care.
              </p>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label
                    htmlFor="checkout-email"
                    className="mb-2 block text-[13px] font-medium uppercase tracking-[0.18em] text-ink/50"
                  >
                    Email address
                  </label>
                  <input
                    ref={inputRef}
                    type="email"
                    id="checkout-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={scrollInputIntoView}
                    required
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    placeholder="you@business.com"
                    className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-base text-ink outline-none transition-colors focus:border-accent"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0 group-disabled:translate-y-full" />
                  <span className="relative">
                    {loading ? "Redirecting…" : "Continue to checkout"}
                  </span>
                </button>
              </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CheckoutButton;
