"use client";
import React, { useEffect } from "react";
import BlogForm from "@/components/BlogForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Page = () => {
  const { role, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== "admin")) {
      router.push("/");
    }
    console.log("user role", role);
  }, [loading, isAuthenticated, role, router]);

  if (loading || !isAuthenticated || role !== "admin") {
    return <div>Loading...</div>;
  }

  return <BlogForm />;
};

export default Page;
