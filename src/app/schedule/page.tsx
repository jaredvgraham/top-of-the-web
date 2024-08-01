"use client";
import ScheduleCall from "@/components/payment/ScheduleCall";
import { useSearchParams } from "next/navigation";

import React, { use, useEffect, useState } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  return <ScheduleCall email={email} />;
};

export default Page;
