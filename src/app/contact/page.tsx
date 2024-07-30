import ContactCard from "@/components/contact/ContactCard";
import InquiryForm from "@/components/contact/InquiryForm";
import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 space-y-8">
      <div className="flex flex-col items-center space-y-8 w-full max-w-4xl">
        <ContactCard />
        <InquiryForm />
      </div>
    </div>
  );
};

export default Page;
