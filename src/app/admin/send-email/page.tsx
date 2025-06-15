"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import withAuth from "@/hoc/withAuth";
import { MassEmail } from "@/components/MassEmail";

const MassEmailPage = () => {
  return <MassEmail />;
};

export default withAuth(MassEmailPage, "admin");
