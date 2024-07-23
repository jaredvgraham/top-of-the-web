import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <main className="flex flex-col justify-between items-center">
      <div className="relative w-full h-screen">
        <div className="absolute -z-10 w-full hero-height">
          <Image
            src="/bg1.jpg"
            alt="background image"
            className="w-full"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              opacity: 0.8,
            }}
            fill
          />
        </div>
        <div className="absolute inset-0 flex justify-center items-center mb-24">
          <h1 className="text-white text-4xl text-center">
            Welcome to, <br />
            Top of the Web
          </h1>
        </div>
      </div>
    </main>
  );
};

export default Hero;
