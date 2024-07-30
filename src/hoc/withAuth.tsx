"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const withAuth = (
  WrappedComponent: React.ComponentType,
  requiredRole: string
) => {
  const ComponentWithAuth = (props: any) => {
    const { role, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      console.log("role", role);
      console.log("useeffect from hoc");

      if (!loading && (!isAuthenticated || role !== requiredRole)) {
        router.push("/login");
      }
    }, [loading, role, router, isAuthenticated]); // Added isAuthenticated as a dependency

    if (loading || role !== requiredRole) {
      return <div className="authloading">Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  // Setting the display name
  ComponentWithAuth.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithAuth;
};

export default withAuth;
