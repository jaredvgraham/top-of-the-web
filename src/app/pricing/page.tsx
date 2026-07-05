import Pricing from "@/components/Pricing";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Pricing - Free Website + $84/mo Hosting | Bsites.io",
  description:
    "See the Bsites managed website plan: a free custom website build with hosting, SSL, maintenance, and basic updates for $84/month.",
};

const page = () => {
  return <Pricing />;
};

export default page;
