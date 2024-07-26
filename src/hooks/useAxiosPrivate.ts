import { useEffect } from "react";
import { axiosPrivate } from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";

const useAxiosPrivate = () => {
  const { accessToken, setAccessToken, logout } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (accessToken && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const response = await axiosPrivate.post(
              "/auth/refresh-token",
              {},
              { withCredentials: true }
            );
            const newAccessToken = response.data.accessToken;
            setAccessToken(newAccessToken);
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return axiosPrivate(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, setAccessToken, logout]);

  return axiosPrivate;
};

export default useAxiosPrivate;
