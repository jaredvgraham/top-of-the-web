"use client";
import Plans from "@/components/Plans";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import React, { use, useEffect, useState } from "react";

const Page = () => {
  const planOptions = [
    { name: "Hosting / Domain", value: "hosting", price: 30 },
    {
      name: "Hosting / Domain / SEO Updates",
      value: "hosting seo",
      price: 200,
    },
    { name: "All + Basic Ads", value: "basic ad", price: 500 },
    { name: "All + Standard Ads", value: "standard ad", price: 1200 },
    { name: "All + Advanced Ads", value: "advanced ad", price: 3000 },
    { name: "All + Rapid Growth Ads", value: "rapid growth ad", price: 5000 },
  ];

  const [selectedPlan, setSelectedPlan] = useState("hosting");
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axiosPrivate.get("/user/order");
        setSelectedPlan(response.data.plan);
        console.log(response.data.plan);
      } catch (error) {
        setError("Failed to fetch order details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  const handleChangePlan = async () => {
    console.log("Plan changed to:", selectedPlan);
    try {
      const res = await axiosPrivate.post("/stripe/upgrade/plan", {
        plan: selectedPlan,
      });
      console.log(res.data);
      setSuccess("Plan changed successfully.");
    } catch (error) {
      console.log(error);
      setError("Failed to change plan.");
    }
  };

  return (
    <div className="p-4 sm:w-10/12 md:w-8/12 lg:w-6/12 mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Change Your Monthly Plan
      </h1>
      <div className="flex flex-wrap gap-6 p-6 bg-gray-100 rounded-lg">
        {planOptions.map((plan) => (
          <div
            key={plan.value}
            onClick={() => setSelectedPlan(plan.value)}
            className={`p-6 border rounded-lg cursor-pointer transform transition-transform duration-300 shadow-lg ${
              selectedPlan === plan.value
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white border-gray-300 hover:bg-gray-200 hover:-translate-y-1"
            }`}
          >
            <p className="text-xl font-semibold">{plan.name}</p>
            <p className="mt-2 text-lg">{plan.price && `$${plan.price}`}</p>
          </div>
        ))}
      </div>
      {error && (
        <div className="bg-red-100 text-red-500 p-4 rounded-lg text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-500 p-4 rounded-lg text-center">
          {success}
        </div>
      )}
      <button
        onClick={handleChangePlan}
        className="w-full bg-blue-500 text-white rounded-lg p-4 shadow-lg"
      >
        Save Changes
      </button>
    </div>
  );
};

export default Page;
