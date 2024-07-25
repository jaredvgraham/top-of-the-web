// pages/mission.tsx
"use client";

import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaHandsHelping, FaLightbulb, FaRegHeart } from "react-icons/fa";

const Mission = () => {
  return (
    <>
      <Head>
        <title>Our Mission - Bsites.io</title>
        <meta
          name="description"
          content="Learn about our mission at Bsites.io. We are dedicated to delivering innovative web development services that help businesses succeed online."
        />
        <meta
          name="keywords"
          content="web development, web design, SEO, digital marketing, cyber security, business solutions"
        />
        <meta property="og:title" content="Our Mission - Bsites.io" />
        <meta
          property="og:description"
          content="Learn about our mission at Bsites.io. We are dedicated to delivering innovative web development services that help businesses succeed online."
        />
        <meta property="og:image" content="/mission-og-image.jpg" />
        <meta property="og:url" content="https://www.bsites.io/mission" />
        <link rel="canonical" href="https://www.bsites.io/mission" />
      </Head>

      <main className="bg-white">
        {/* Hero Section */}
        <section
          className="relative h-screen flex items-center justify-center bg-cover bg-center text-white"
          style={{ backgroundImage: "url('/mission-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <motion.div
            className="relative z-10 text-center p-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-6xl font-bold mb-4">Our Mission</h1>
            <p className="text-2xl">
              Empowering businesses through innovative web development
              solutions.
            </p>
          </motion.div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto text-center px-4">
            <motion.h2
              className="text-5xl font-extrabold mb-16 text-gray-800"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              What Drives Us
            </motion.h2>
            <div className="flex flex-wrap justify-center items-stretch gap-8">
              {[
                {
                  icon: <FaHandsHelping />,
                  color: "text-green-500",
                  title: "Client-Centric",
                  description:
                    "Our mission is to place our clients at the center of everything we do, ensuring their satisfaction and success with our services.",
                },
                {
                  icon: <FaLightbulb />,
                  color: "text-yellow-500",
                  title: "Innovation",
                  description:
                    "We strive to continuously innovate and implement cutting-edge technologies to deliver the best solutions for our clients.",
                },
                {
                  icon: <FaRegHeart />,
                  color: "text-red-500",
                  title: "Passion",
                  description:
                    "Our team is passionate about web development and dedicated to delivering high-quality services that exceed expectations.",
                },
              ].map((mission, index) => (
                <motion.div
                  key={index}
                  className="flex-1 min-w-[300px] p-8 bg-white rounded-lg shadow-lg flex flex-col items-center transition-transform duration-500 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                    delay: 0.2 * index,
                  }}
                >
                  <div className={`text-6xl mb-4 ${mission.color}`}>
                    {mission.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    {mission.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {mission.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 flex flex-wrap items-center justify-between">
            <motion.div
              className="w-full md:w-1/2 p-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image
                src="/our-approach.jpg"
                alt="Our Approach"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div
              className="w-full md:w-1/2 p-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-4xl font-extrabold mb-4 text-gray-800">
                Our Approach
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                At Bsites.io, our mission is to empower businesses by providing
                innovative, high-quality web development solutions. We are
                committed to understanding our clients' unique needs and
                delivering services that drive success and growth. Our team is
                dedicated to continuous improvement and staying ahead of
                industry trends to offer the best solutions to our clients.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe in the power of collaboration and are passionate
                about helping businesses thrive in the digital landscape. Our
                commitment to excellence, innovation, and customer satisfaction
                drives everything we do. Let us help you achieve your business
                goals with tailored web development solutions that make a real
                impact.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto text-center px-4">
            <motion.h2
              className="text-5xl font-extrabold mb-16 text-gray-800"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Customer Testimonials
            </motion.h2>
            <div className="flex flex-wrap justify-center items-stretch gap-8">
              {[
                {
                  name: "John Doe",
                  feedback:
                    "Bsites.io provided us with an exceptional website that has greatly improved our online presence. Their team is professional, efficient, and highly skilled.",
                  image: "/customer1.jpg",
                },
                {
                  name: "Jane Smith",
                  feedback:
                    "Working with Bsites.io was a fantastic experience. They understood our needs and delivered a website that exceeded our expectations. Highly recommend!",
                  image: "/customer2.jpg",
                },
                {
                  name: "Mike Johnson",
                  feedback:
                    "The team at Bsites.io is incredibly talented and dedicated. They provided us with a top-notch website and excellent customer" +
                    " service. We are thrilled with the results!",
                  image: "/customer3.jpg",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="flex-1 min-w-[300px] p-8 bg-white rounded-lg shadow-lg flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                    delay: 0.2 * index,
                  }}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    {testimonial.name}
                  </h3>
                  <p className="text-gray-600 text-center">
                    "{testimonial.feedback}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Mission;
