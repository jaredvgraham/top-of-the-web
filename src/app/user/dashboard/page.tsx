"use client";
import React, { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaBox, FaClipboardCheck, FaChartLine } from "react-icons/fa";

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Your Dashboard
        </h1>
        {loading ? (
          <div className="flex items-center justify-center">
            <AiOutlineLoading3Quarters className="animate-spin text-4xl text-gray-600" />
          </div>
        ) : error ? (
          <p className="text-lg text-red-500 text-center">{error}</p>
        ) : order ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <FaBox className="text-2xl text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Website Package
                  </h2>
                </div>
                <p className="text-gray-600">{order.pack}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <FaClipboardCheck className="text-2xl text-green-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Plan</h2>
                </div>
                <p className="text-gray-600">{order.plan}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <FaChartLine className="text-2xl text-purple-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Progress</h2>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-600 h-6 rounded-full"
                    style={{ width: `${(order.progress / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{`Progress: ${order.progress} / 5`}</p>
              </div>
            </div>
            <div className=" w-4/6 bg-white mx-auto mt-4 ">
              <h1 className="text-center">OverView</h1>
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-600 text-center">
            No order details available.
          </p>
        )}
      </div>
    </div>
  );
};

export default withAuth(Page, "user");
