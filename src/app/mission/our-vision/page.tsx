// pages/vision.tsx
"use client";

import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { FaGlobe, FaUsers, FaRocket, FaHandshake } from "react-icons/fa";

const Vision = () => {
  return (
    <>
      <Head>
        <title>Our Vision - Bsites.io</title>
        <meta
          name="description"
          content="Discover our vision at Bsites.io. We aim to empower businesses with innovative web development services tailored to their unique needs."
        />
        <meta
          name="keywords"
          content="web development, web design, SEO, digital marketing, cyber security, business solutions"
        />
        <meta property="og:title" content="Our Vision - Bsites.io" />
        <meta
          property="og:description"
          content="Discover our vision at Bsites.io. We aim to empower businesses with innovative web development services tailored to their unique needs."
        />
        <meta property="og:image" content="/vision-og-image.jpg" />
        <meta property="og:url" content="https://www.bsites.io/vision" />
        <link rel="canonical" href="https://www.bsites.io/vision" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Our Vision",
            url: "https://www.bsites.io/vision",
            description:
              "Discover our vision at Bsites.io. We aim to empower businesses with innovative web development services tailored to their unique needs.",
            mainEntityOfPage: {
              "@type": "WebSite",
              "@id": "https://www.bsites.io",
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.bsites.io",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Our Vision",
                  item: "https://www.bsites.io/vision",
                },
              ],
            },
          })}
        </script>
      </Head>
      <main className="py-16 bg-gray-50">
        <div className="container mx-auto text-center px-4">
          <motion.h1
            className="text-5xl font-extrabold mb-8 text-gray-800"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Our Vision
          </motion.h1>
          <motion.p
            className="text-xl mb-12 text-gray-600"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            At Bsites.io, we believe in empowering businesses through innovative
            web development services tailored to their unique needs.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaGlobe />,
                color: "text-blue-500",
                title: "Global Reach",
                description:
                  "We aim to provide our services to businesses around the globe, helping them establish a strong online presence.",
              },
              {
                icon: <FaUsers />,
                color: "text-green-500",
                title: "Customer Focus",
                description:
                  "Our customers are at the heart of everything we do. We strive to exceed their expectations and deliver exceptional value.",
              },
              {
                icon: <FaRocket />,
                color: "text-red-500",
                title: "Innovation",
                description:
                  "Innovation drives our solutions. We leverage cutting-edge technologies to create modern, efficient, and scalable web applications.",
              },
              {
                icon: <FaHandshake />,
                color: "text-yellow-500",
                title: "Partnership",
                description:
                  "We believe in building long-term partnerships with our clients, working together to achieve mutual success.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative p-8 bg-white rounded-lg shadow-lg flex flex-col items-center transition-transform duration-500 hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.2 * index,
                }}
              >
                <div
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md ${step.color}`}
                >
                  <div className="text-3xl">{step.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="container mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-extrabold mb-4 text-gray-800">
            Websites That Take Your Business Further
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            At Bsites.io, our vision is to empower small businesses by providing
            affordable, professional, and highly functional websites. With years
            of experience, our team of skilled web developers specializes in
            using cutting-edge technologies such as Next.js, React, and other
            modern frameworks that outperform traditional solutions like
            WordPress. We offer highly customized web solutions, including
            dynamic content rendering, server-side rendering for improved SEO,
            and lightning-fast page loads, which WordPress often struggles to
            achieve. Our expertise allows us to create complex web applications,
            implement advanced user authentication systems, and seamlessly
            integrate third-party services, all tailored to your unique business
            needs. By leveraging these advanced technologies, we ensure your
            business stands out in today's competitive digital landscape,
            offering you a seamless, efficient, and scalable online experience
            that goes beyond the limitations of traditional platforms.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mt-4">
            We are committed to continuous improvement and excellence in
            everything we do. Our approach is centered around understanding your
            business goals and challenges, and crafting solutions that drive
            growth and success. We believe in building long-term partnerships
            with our clients, offering ongoing support and maintenance to ensure
            your website remains up-to-date and performs optimally as your
            business evolves. At Bsites.io, we are passionate about helping
            businesses thrive in the digital age by delivering innovative,
            high-quality web development services that make a real impact.
          </p>
        </div>
      </main>
    </>
  );
};

export default Vision;
