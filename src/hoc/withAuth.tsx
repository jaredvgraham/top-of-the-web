"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const withAuth = (
  WrappedComponent: React.ComponentType,
  requiredRole: string
) => {
  return (props: any) => {
    const { role, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!isAuthenticated || role !== requiredRole)) {
        router.push("/login");
      }
    }, [loading, isAuthenticated, role, router]);

    if (loading || !isAuthenticated || role !== requiredRole) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
