"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaRocket, FaRegGem, FaHeadset, FaDollarSign } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

const WhyUs = () => {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref3, inView3] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="w-full py-16 ">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Why Bsites.io?
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div
          ref={ref1}
          className="p-8 m-4 rounded-lg shadow-2xl bg-white"
          initial={{ opacity: 0, x: -200 }}
          animate={inView1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -200 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <FaRocket className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Fast Delivery
          </h2>
          <p className="text-gray-600">
            Time is of the essence in today's fast-paced business environment,
            and we pride ourselves on delivering high-quality websites within an
            impressive timeframe of 1 to 5 days. Unlike many competitors who may
            take weeks or even months to complete a project, our efficient
            workflow and experienced team enable us to deliver rapid results
            without compromising on quality. This quick turnaround time allows
            you to launch your website sooner, helping you to start attracting
            customers and generating revenue almost immediately.
          </p>
        </motion.div>
        <motion.div
          ref={ref2}
          className="p-8 bg-white m-4 rounded-lg shadow-2xl"
          initial={{ opacity: 0, y: 200 }}
          animate={inView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 200 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <FaRegGem className="text-4xl text-cyan-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Quality Products
          </h2>
          <p className="text-gray-600">
            At Bsites.io, we understand that every business, whether big or
            small, has unique needs and goals. Our web development services are
            tailored to accommodate businesses of any size, ensuring that you
            receive a website that perfectly aligns with your brand and
            objectives. From startups to established enterprises, we create
            customized, scalable solutions that help you stand out in a
            competitive market. Our dedicated team works closely with you to
            understand your vision and deliver a product that not only meets but
            exceeds your expectations.
          </p>
        </motion.div>
        <motion.div
          ref={ref3}
          className="p-8  m-4 rounded-lg shadow-2xl bg-white "
          initial={{ opacity: 0, x: 200 }}
          animate={inView3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 200 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <FaDollarSign className="text-4xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Affordable Pricing
          </h2>
          <p className="text-gray-600">
            One of the biggest challenges businesses face when developing a
            website is balancing quality with cost. At Bsites.io, we offer a
            range of price packages starting from just $800 and going up to
            $3,500. This makes our services accessible to a wide range of
            businesses without compromising on quality. Compared to the industry
            average, where custom websites can range from $5,000 to $30,000, our
            pricing is significantly more affordable. We believe in transparent
            pricing with no hidden fees, ensuring you get the best value for
            your investment.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WhyUs;
