"use client";
import React from "react";
import withAuth from "@/hoc/withAuth";
import BlogForm from "@/components/BlogForm";

const AdminPage = () => {
  return <BlogForm />;
};

export default withAuth(AdminPage, "admin");
