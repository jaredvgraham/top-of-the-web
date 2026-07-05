import ContactCard from "@/components/contact/ContactCard";
import InquiryForm from "@/components/contact/InquiryForm";
import Footer from "@/components/HomePage/Footer";
import CheckoutButton from "@/components/checkout/CheckoutButton";
import React from "react";

const Page = () => {
  return (
    <>
      <main className="grain relative min-h-screen bg-paper px-5 pb-24 pt-36 sm:px-8 sm:pt-44">
        <div className="relative mx-auto max-w-[1400px]">
          <div className="mb-16 sm:mb-20">
            <p className="mb-8 text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50">
              Contact — Questions & custom builds
            </p>
            <h1 className="font-display display-tight max-w-5xl text-6xl font-medium text-ink sm:text-8xl lg:text-[8.5rem]">
              Talk to us{" "}
              <em className="font-light italic text-accent">first</em>.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-ink/70">
              Use the form below if you have questions, need a custom scope, or
              want to discuss your business before subscribing. Ready to sign
              up? Start checkout instead.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CheckoutButton
                label="Start Checkout — $84/mo"
                className="group relative overflow-hidden rounded-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-paper"
              />
              <p className="text-sm text-ink/50">
                or send a message with the form below
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <ContactCard />
            <InquiryForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Page;
