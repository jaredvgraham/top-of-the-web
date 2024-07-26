import ContactCard from "@/components/ContactCard";
import InquiryForm from "@/components/InquiryForm";
import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 space-y-8">
      <ContactCard />
      <InquiryForm />
    </div>
  );
};

export default Page;
