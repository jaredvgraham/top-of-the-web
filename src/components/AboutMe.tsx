"use client";
import Image from "next/image";
import React from "react";
import { use, useEffect, useState } from "react";

const AboutMe = () => {
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

  return (
    <div
      id="about"
      className={`w-11/12 ${
        !isMobile && "w-3/5"
      }flex flex-col   justify-center mx-auto items-center p-8 whiteBoxTwo `}
    >
      <h1 className="text-center text-3xl p-4">Our Vision</h1>
      <div
        className={` flex justify-center  ${isMobile && "flex-col"} ${
          !isMobile && "ml-16 "
        }`}
      >
        {/* <Image
          src="/jake.png"
          alt="logo"
          width={300}
          height={300}
          className=" self-center rounded-lg"
        /> */}

        <p className={`p-5  ${!isMobile && "w-1/2 pt-0"}`}>
          At Top of the Web, our vision is to empower small businesses by
          providing affordable, professional, and highly functional websites.
          With years of experience, our team of skilled web developers
          specializes in using cutting-edge technologies such as Next.js, React,
          and other modern frameworks that outperform traditional solutions like
          WordPress. We offer highly customized web solutions, including dynamic
          content rendering, server-side rendering for improved SEO, and
          lightning-fast page loads, which WordPress often struggles to achieve.
          Our expertise allows us to create complex web applications, implement
          advanced user authentication systems, and seamlessly integrate
          third-party services, all tailored to your unique business needs. By
          leveraging these advanced technologies, we ensure your business stands
          out in today's competitive digital landscape, offering you a seamless,
          efficient, and scalable online experience that goes beyond the
          limitations of traditional platforms.
        </p>
      </div>
    </div>
  );
};

export default AboutMe;
