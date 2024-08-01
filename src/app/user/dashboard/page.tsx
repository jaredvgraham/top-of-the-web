"use client";
import React, { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaBox, FaClipboardCheck, FaChartLine, FaEdit } from "react-icons/fa";
import { IWebsite } from "@/models/WebsiteModel";

type Order = {
  id: number;
  pack: string;
  plan: string;
  price: number;
  progress: number;
};

type Website = {
  name: string;
  url: string;
  description: string;
};

const Page = () => {
  const { logout } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [order, setOrder] = useState<Order | null>(null);
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setEditing] = useState(false);
  const [editedWebsite, setEditedWebsite] = useState<Website | null>(null);

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

    const fetchWebsite = async () => {
      try {
        const response = await axiosPrivate.get("/user/website");
        setWebsite(response.data);
        setEditedWebsite(response.data); // Initialize editedWebsite with fetched website data
      } catch (error) {
        setError("Failed to fetch website details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    fetchWebsite();
  }, []);

  const handleSave = async () => {
    console.log(editedWebsite);

    try {
      if (editedWebsite) {
        const res = await axiosPrivate.put("/user/website", {
          name: editedWebsite.name,
          description: editedWebsite.description,
        });

        setWebsite((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: editedWebsite.name,
            description: editedWebsite.description,
          };
        });
        setEditing(false);
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to check domain. Was it in the right format? example.com."
      );
      console.error(error);
    }
  };

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
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <FaBox className="text-2xl text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Website Package
                  </h2>
                </div>
                <p className="text-gray-600">{order?.pack}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <FaClipboardCheck className="text-2xl text-green-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Plan</h2>
                </div>
                <p className="text-gray-600">
                  {order &&
                    order?.plan.charAt(0).toUpperCase() + order?.plan.slice(1)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <FaChartLine className="text-2xl text-purple-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Progress</h2>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-600 h-6 rounded-full"
                    style={{ width: `${((order?.progress ?? 0) / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{`Progress: ${order?.progress} / 5`}</p>
              </div>
            </div>
            {website && (
              <div className="mt-10 bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  Website Overview
                </h2>
                <div className="space-y-4">
                  {!isEditing ? (
                    <div className="flex items-center justify-between ">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Website Name:
                      </h3>
                      <div className="flex items-center">
                        <p className="text-lg text-gray-600 pr-2">
                          {website.name ? website.name : "example.com"}
                        </p>
                        <FaEdit
                          className="text-blue-500 cursor-pointer"
                          onClick={() => setEditing(true)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Website Name:
                      </h3>
                      <input
                        type="text"
                        value={editedWebsite?.name || ""}
                        onChange={(e) =>
                          setEditedWebsite({
                            ...(editedWebsite as Website),
                            name: e.target.value,
                          })
                        }
                        className="w-1/2 p-2 border border-gray-300 rounded-lg"
                      />
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Website URL:
                    </h3>
                    <p className="text-lg text-gray-600 pr-2">
                      {website.url ? website.url : "No url yet."}
                    </p>
                  </div>
                  <div className="flex items-center flex-col">
                    {!isEditing ? (
                      <>
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-700 pr-2">
                            Website Description:
                          </h3>
                          <FaEdit
                            className="text-blue-500 cursor-pointer"
                            onClick={() => setEditing(true)}
                          />
                        </div>
                        <div className="flex items-center">
                          <p className="text-lg text-gray-600 pr-2">
                            {website.description}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-700">
                          Website Description:
                        </h3>
                        <textarea
                          value={editedWebsite?.description || ""}
                          onChange={(e) =>
                            setEditedWebsite({
                              ...(editedWebsite as Website),
                              description: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded ml-2"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default withAuth(Page, "user");
