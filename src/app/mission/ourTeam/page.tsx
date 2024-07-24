"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const OurTeam = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1408);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 3, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 2, ease: "easeOut" },
    },
  };

  return (
    <div className="p-8  bg-gray-50">
      <section className="mt-16">
        <motion.h1
          className="text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          Our Team
        </motion.h1>
        <div
          className={`flex w-full ${
            isMobile ? "flex-wrap justify-center" : ""
          }`}
        >
          <motion.div
            className="bg-white p-6 m-4 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              className="relative w-60 h-80 mx-auto"
              variants={itemVariants}
            >
              <Image
                src="/IMG_5559 2.JPG"
                alt="Evan Wilson"
                className="full rounded-lg shadow-lg"
                style={{ objectFit: "cover" }}
                fill
              />
            </motion.div>
            <motion.h3
              className="text-xl font-semibold text-center mt-4 text-gray-800"
              variants={itemVariants}
            >
              Evan Wilson
            </motion.h3>
            <motion.p
              className="text-center text-gray-600"
              variants={itemVariants}
            >
              Developer/Co-Founder
            </motion.p>
            <motion.p
              className="text-center mt-2 text-gray-600"
              variants={itemVariants}
            >
              Evan Wilson is a seasoned web developer specializing in backend
              development and database integration. With a deep passion for
              creating robust and efficient web solutions, Evan has consistently
              delivered high-quality projects that exceed client expectations.
              His expertise spans multiple technologies, ensuring seamless and
              scalable backend systems. Evan is dedicated to continuous learning
              and innovation, making him a valuable asset to any development
              team.
            </motion.p>
          </motion.div>
          <motion.div
            className="bg-white p-6 m-4 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="relative w-60 h-80 mx-auto"
              variants={itemVariants}
            >
              <Image
                src="/IMG_0592.jpg"
                alt="Jared Graham"
                className="full rounded-lg shadow-lg"
                style={{ objectFit: "cover" }}
                fill
              />
            </motion.div>
            <motion.h3
              className="text-xl font-semibold text-center mt-4 text-gray-800"
              variants={itemVariants}
            >
              Jared Graham
            </motion.h3>
            <motion.p
              className="text-center text-gray-600"
              variants={itemVariants}
            >
              Developer/Co-Founder
            </motion.p>
            <motion.p
              className="text-center mt-2 text-gray-600"
              variants={itemVariants}
            >
              Jared Graham is a talented front-end developer and designer with a
              keen eye for aesthetics and user experience. Specializing in
              creating visually appealing and highly functional interfaces,
              Jared combines his expertise in design with cutting-edge front-end
              technologies. His passion lies in crafting intuitive and engaging
              user experiences that not only meet but exceed client
              expectations. Jared&apos;s dedication to staying current with
              industry trends ensures that every project he undertakes is
              innovative and modern. He is committed to delivering top-notch
              design solutions that elevate the digital presence of any brand.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="mb-16">
        <motion.h2
          className="text-2xl font-semibold text-center mb-8 text-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3 }}
        >
          Join Our Team
        </motion.h2>
        <motion.p
          className="text-center max-w-3xl mx-auto text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3, delay: 0.2 }}
        >
          We are always looking for talented and passionate individuals to join
          our team. If you are interested in working with us, please contact us
          at{" "}
          <a href="mailto:info@yourcompany.com" className="text-blue-500">
            info@yourcompany.com
          </a>
          .
        </motion.p>
      </section>

      <section className="mb-16">
        <motion.h2
          className="text-2xl font-semibold text-center mb-8 text-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3 }}
        >
          Contact Us
        </motion.h2>
        <motion.p
          className="text-center max-w-3xl mx-auto text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3, delay: 0.2 }}
        >
          If you have any questions or would like to learn more about our
          services, feel free to reach out to us. We are here to help you
          achieve your web development goals.
        </motion.p>
      </section>
    </div>
  );
};

export default OurTeam;
