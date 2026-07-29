import ContactCard from "@/components/contact/ContactCard";
import InquiryForm from "@/components/contact/InquiryForm";
import Footer from "@/components/HomePage/Footer";
import CheckoutButton from "@/components/checkout/CheckoutButton";
import Link from "next/link";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Contact — Questions & Custom Website Builds",
  description:
    "Talk to Bsites about a custom website build, pricing questions, or a larger scope. Call (781) 336-7274, email us, or send a message — we reply within one business day.",
  alternates: { canonical: "/contact" },
};

const Page = () => {
  return (
    <>
      <main className="grain relative min-h-screen bg-paper px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <div className="relative mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-x-20 lg:gap-y-12">
            {/* Pitch */}
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <p className="mb-6 text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50">
                Contact — Questions &amp; custom builds
              </p>
              <h1 className="font-display display-tight text-5xl font-medium text-ink sm:text-7xl lg:text-[5.5rem]">
                Talk to us{" "}
                <em className="font-light italic text-accent">first</em>.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-ink/70">
                Questions, a custom scope, or just want to talk to a human
                before you commit? Send a message and we reply personally —
                usually within one business day.
              </p>
            </div>

            {/* The form is the primary action: first thing after the headline
                on mobile, right-hand column on desktop. */}
            <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <InquiryForm />
            </div>

            {/* Direct lines + shortcuts */}
            <div className="min-w-0 lg:col-start-1 lg:row-start-2">
              <div className="rounded-3xl bg-ink p-7 text-paper sm:p-8">
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-paper/50">
                  Prefer to talk right now?
                </p>
                <a
                  href="tel:+17813367274"
                  className="font-display mt-5 flex min-h-14 w-fit items-center text-3xl font-medium tracking-tight transition-colors hover:text-accentSoft sm:text-4xl"
                >
                  (781) 336-7274
                </a>
                <a
                  href="mailto:bsitesioteam@gmail.com"
                  className="mt-2 flex min-h-12 w-fit items-center break-all text-lg text-paper/80 transition-colors hover:text-paper"
                >
                  bsitesioteam@gmail.com
                </a>
                <p className="mt-5 border-t border-paper/15 pt-5 text-sm leading-6 text-paper/55">
                  Studio in Plymouth, Massachusetts — serving businesses
                  nationwide. Replies usually within one business day.
                </p>
              </div>

              <div className="mt-10 border-t border-ink/10 pt-8">
                <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-ink/50">
                  Already know what you want?
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/#start"
                    className="inline-flex min-h-14 items-center justify-center rounded-full bg-ink px-8 text-sm font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-accent"
                  >
                    See my free demo
                  </Link>
                  <div className="w-full sm:w-[230px]">
                    <CheckoutButton
                      modalTitle="Start your $84/mo plan"
                      modalDescription="Enter your email to continue to Stripe. $0 for the build today, then $84/mo for hosting and care. Cancel anytime."
                      submitLabel="Continue to Stripe"
                      className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-ink/25 px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                    >
                      Buy now — $84/mo
                    </CheckoutButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ContactCard />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Page;
