import React, { use, useEffect, useState } from "react";

type PlanProps = {
  setPlan: (plan: string) => void;
};

const planOptions = [
  { name: "Hosting / Domain", value: "hosting", price: 30 },
  { name: "All + SEO Updates", value: "hosting seo", price: 200 },
  { name: "All + Basic Ads", value: "basic ad", price: 500 },
  { name: "All + Standard Ads", value: "standard ad", price: 1200 },
  { name: "All + Advanced Ads", value: "advanced ad", price: 3000 },
  { name: "All + Rapid Growth Ads", value: "rapid growth ad", price: 5000 },
  { name: "Test", value: "test" },
];

const Plans = ({ setPlan }: PlanProps) => {
  const [selectedPlan, setSelectedPlan] = useState("hosting");

  useEffect(() => {
    setPlan(selectedPlan);
  }, [selectedPlan, setPlan]);

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-1  text-center">
        Choose a monthly Plan (Required)
      </h1>
      <div className="flex flex-wrap gap-4 p-4 bg-gray-100 rounded-lg">
        {planOptions.map((plan) => (
          <div
            key={plan.value}
            onClick={() => setSelectedPlan(plan.value)}
            className={`p-4 border rounded-lg cursor-pointer transform transition-transform duration-300 shadow-lg ${
              selectedPlan === plan.value
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white border-gray-300 hover:bg-gray-200 hover:-translate-y-1"
            }`}
          >
            <p>{plan.name}</p>
            <p>{plan.price && `$${plan.price}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
