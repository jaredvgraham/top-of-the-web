"use client";
import React, { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

type Order = {
  id: number;
  pack: string;
  plan: string;
  price: number;
  progress: number;
};

const Page = () => {
  const { logout } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axiosPrivate.get("/user/order");
        setOrder(response.data);
      } catch (error) {
        setError("Failed to fetch order details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-5">Your Order</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : order ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          <div className="mb-2">
            <p className="font-semibold">Website Package:</p>
            <p>{order.pack}</p>
          </div>
          <div className="mb-2">
            <p className="font-semibold">Plan:</p>
            <p>{order.plan}</p>
          </div>
          <div className="mb-2">
            <p className="font-semibold">Status:</p>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-blue-600 h-6 rounded-full"
                style={{ width: `${(order.progress / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1">{`Progress: ${order.progress} / 5`}</p>
          </div>
        </div>
      ) : (
        <p>No order details available.</p>
      )}
    </div>
  );
};

export default withAuth(Page, "user");
