"use client";
import React from "react";
import withAuth from "@/hoc/withAuth";
import { useAuth } from "@/context/AuthContext";

const page = () => {
  const { logout } = useAuth();
  return (
    <div>
      <h1>User Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default withAuth(page, "user");
