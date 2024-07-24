"use client";

import React from "react";
import Image from "next/image";

const OurTeam = () => {
  return (
    <div className="p-8 mt-16 ">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Our Team
      </h1>

      {/* <section className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700">
          Our Mission
        </h2>
        <p className="text-center max-w-3xl mx-auto text-gray-600">
          Our mission is to provide top-notch web development services,
          delivering innovative and efficient web solutions that drive business
          success. We are committed to continuous improvement and excellence in
          everything we do.
        </p>
      </section> */}

      <section className="mb-16">
        {/* <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700">
          Our Team Members
        </h2> */}
        <div className="flex flex-wrap justify-around">
          <div className="bg-white p-6 m-4 rounded-lg shadow-lg w-80">
            <div className="relative w-60 h-80 mx-auto">
              <Image
                src="/IMG_5559 2.JPG"
                alt="Evan Wilson"
                className="full"
                style={{ objectFit: "cover" }}
                fill
              />
            </div>
            <h3 className="text-xl font-semibold text-center mt-4 text-gray-800">
              Evan Wilson
            </h3>
            <p className="text-center text-gray-600">Developer/Co-Founder</p>
            <p className="text-center mt-2 text-gray-600">
              Evan Wilson is a seasoned web developer specializing in backend
              development and database integration. With a deep passion for
              creating robust and efficient web solutions, Evan has consistently
              delivered high-quality projects that exceed client expectations.
              His expertise spans multiple technologies, ensuring seamless and
              scalable backend systems. Evan is dedicated to continuous learning
              and innovation, making him a valuable asset to any development
              team.
            </p>
          </div>
          <div className="bg-white p-6 m-4 rounded-lg shadow-lg w-80">
            <div className="relative w-60 h-80 mx-auto">
              <Image
                src="/IMG_0592.jpg"
                alt="Jared Graham"
                className="full"
                style={{ objectFit: "cover" }}
                fill
              />
            </div>
            <h3 className="text-xl font-semibold text-center mt-4 text-gray-800">
              Jared Graham
            </h3>
            <p className="text-center text-gray-600">Developer/Co-Founder</p>
            <p className="text-center mt-2 text-gray-600">
              Jared is a talented front-end developer and designer with a keen
              eye for aesthetics and user experience. Specializing in creating
              visually appealing and highly functional interfaces, Jared
              combines his expertise in design with cutting-edge front-end
              technologies. His passion lies in crafting intuitive and engaging
              user experiences that not only meet but exceed client
              expectations. Jared's dedication to staying current with industry
              trends ensures that every project he undertakes is innovative and
              modern. He is committed to delivering top-notch design solutions
              that elevate the digital presence of any brand.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700">
          Join Our Team
        </h2>
        <p className="text-center max-w-3xl mx-auto text-gray-600">
          We are always looking for talented and passionate individuals to join
          our team. If you are interested in working with us, please contact us
          at{" "}
          <a href="mailto:info@yourcompany.com" className="text-blue-500">
            info@yourcompany.com
          </a>
          .
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700">
          Contact Us
        </h2>
        <p className="text-center max-w-3xl mx-auto text-gray-600">
          If you have any questions or would like to learn more about our
          services, feel free to reach out to us. We are here to help you
          achieve your web development goals.
        </p>
      </section>
    </div>
  );
};

export default OurTeam;
