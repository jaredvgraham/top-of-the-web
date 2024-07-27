"use client";
import React from "react";
import withAuth from "@/hoc/withAuth";

const page = () => {
  return <div>page</div>;
};

export default withAuth(page, "user");
