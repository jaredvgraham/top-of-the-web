"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { axiosPublic } from "@/utils/axios";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  role: string | null;
  setRole: (role: string) => void;
  loading: boolean;
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;

  logout: () => void;
  refreshSession: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axiosPublic.get("/auth/session");
        setAccessToken(response.data.accessToken);
        setRole(response.data.user.role);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    checkAuthentication();
  }, []);

  const logout = () => {
    try {
      axiosPublic.post("/auth/logout");
      setAccessToken(null);
      setIsAuthenticated(false);
      setLoading(false);
      router.push("/");
    } catch (error) {
      setLoading(false);
      console.log("error logging out", error);
    }
  };

  const refreshSession = async () => {
    try {
      const response = await axiosPublic.post("/auth/refresh-token");
      setAccessToken(response.data.accessToken);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        role,
        setRole,
        loading,
        accessToken,
        setAccessToken,

        logout,
        refreshSession,
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
