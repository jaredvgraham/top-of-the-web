import ContactCard from "@/components/contact/ContactCard";
import InquiryForm from "@/components/contact/InquiryForm";
import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Contact Us
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            We'd love to hear from you! Whether you have a question about
            features, trials, pricing, or anything else, our team is ready to
            answer all your questions.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ContactCard />
          <InquiryForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
