import React from "react";
import Head from "next/head";
import Link from "next/link";
import Footer from "@/components/HomePage/Footer";

export default function ThankYou() {
  return (
    <>
      <Head>
        <title>Thank You - Bsites.io</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Thank You for Your Purchase!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {` We've received your order and will get started on your new website
            right away. You will receive an email confirmation shortly with all
            the details.`}
          </p>
          <p className="text-lg text-gray-600 mb-8">
            In the meantime, if you have any questions, feel free to contact us
            at{" "}
            <a
              href="mailto:bsitesioteam@gmail.com"
              className="text-blue-600 hover:underline"
            >
              bsitesioteam@gmail.com
            </a>
            .
          </p>
          <Link href="/" legacyBehavior>
            <a className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
              Back to Homepage
            </a>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
