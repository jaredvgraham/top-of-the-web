import ContactCard from "@/components/contact/ContactCard";
import InquiryForm from "@/components/contact/InquiryForm";
import Footer from "@/components/HomePage/Footer";
import React from "react";

const Page = () => {
  return (
    <>
      <main className="grain relative min-h-screen bg-paper px-5 pb-24 pt-36 sm:px-8 sm:pt-44">
        <div className="relative mx-auto max-w-[1400px]">
          <div className="mb-16 sm:mb-20">
            <p className="mb-8 text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50">
              Contact — Start your build
            </p>
            <h1 className="font-display display-tight max-w-5xl text-6xl font-medium text-ink sm:text-8xl lg:text-[8.5rem]">
              Claim your{" "}
              <em className="font-light italic text-accent">free</em> website.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-ink/70">
              Tell us about your business and we&apos;ll follow up to confirm
              the fit, timeline, and next steps for the $84/month hosting and
              care plan.
            </p>
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
