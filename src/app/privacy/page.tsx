import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/HomePage/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Bsites.io collects, uses, and protects your personal information when you use our website and services.",
  openGraph: {
    title: "Privacy Policy - Bsites.io",
    description:
      "Learn how Bsites.io collects, uses, and protects your personal information when you use our website and services.",
    url: "https://www.bsites.io/privacy",
  },
};

const lastUpdated = "July 3, 2026";

const PrivacyPolicyPage = () => {
  return (
    <>
      <div className="min-h-screen bg-paper px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </header>

          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 space-y-10 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Introduction
              </h2>
              <p>
                Bsites.io (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                is a web development agency based in Plymouth, Massachusetts. We
                operate the website at{" "}
                <Link
                  href="https://www.bsites.io"
                  className="text-blue-600 hover:underline"
                >
                  www.bsites.io
                </Link>{" "}
                and provide custom website design, development, and related
                digital services.
              </p>
              <p className="mt-4">
                This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you visit our website, contact
                us, purchase our services, or otherwise interact with us. By
                using our website or services, you agree to the practices
                described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Information We Collect
              </h2>
              <p className="mb-4">
                We may collect the following types of information:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Information you provide directly
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Contact inquiries:</strong> When you submit our
                  contact form, we collect your name, email address, phone
                  number, and message content.
                </li>
                <li>
                  <strong>Purchases and orders:</strong> When you buy a website
                  package, we collect your email address, phone number, and
                  details about the package or plan you selected.
                </li>
                <li>
                  <strong>Scheduled calls:</strong> If you schedule a
                  consultation with us, we collect your email address, phone
                  number, preferred call time, and any title or subject you
                  provide.
                </li>
                <li>
                  <strong>Communications:</strong> If you email or call us, we
                  may retain the content of those communications along with your
                  contact details.
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment information
              </h3>
              <p className="mb-6">
                Payments are processed by Stripe, a third-party payment
                processor. We do not store your full credit card number or
                payment card details on our servers. Stripe may collect billing
                information, email address, and phone number as part of the
                checkout process. Stripe&apos;s use of your information is
                governed by{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Stripe&apos;s Privacy Policy
                </a>
                .
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Automatically collected information
              </h3>
              <p>
                When you visit our website, our servers may automatically
                collect certain technical information, such as your IP address,
                browser type, operating system, referring URLs, and pages
                viewed. This information helps us maintain and improve our
                website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Use Your Information
              </h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to your inquiries and provide customer support</li>
                <li>Process and fulfill orders for our website packages</li>
                <li>
                  Schedule and conduct consultations and project kickoff calls
                </li>
                <li>
                  Send order confirmations, project updates, and service-related
                  communications
                </li>
                <li>
                  Send marketing or promotional emails to existing customers,
                  where permitted by law
                </li>
                <li>Improve our website, services, and user experience</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Share Your Information
              </h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your
                information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Service providers:</strong> We use trusted third
                  parties to help operate our business, including Stripe for
                  payment processing and email delivery services for
                  communications. These providers access your information only
                  as needed to perform services on our behalf.
                </li>
                <li>
                  <strong>Legal requirements:</strong> We may disclose
                  information if required by law, court order, or government
                  request, or when we believe disclosure is necessary to protect
                  our rights, safety, or the rights of others.
                </li>
                <li>
                  <strong>Business transfers:</strong> If we are involved in a
                  merger, acquisition, or sale of assets, your information may
                  be transferred as part of that transaction.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Storage and Retention
              </h2>
              <p>
                Contact form submissions are delivered to our business email
                inbox and are not stored in a customer database. Order,
                customer, and scheduled call information is stored in a secure
                database hosted by our cloud infrastructure provider.
              </p>
              <p className="mt-4">
                We retain your personal information for as long as necessary to
                fulfill the purposes described in this policy, including to
                provide our services, maintain business records, and comply with
                legal obligations. When information is no longer needed, we
                take reasonable steps to delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cookies and Similar Technologies
              </h2>
              <p>
                Our website may use essential cookies and similar technologies
                required for basic site functionality, such as maintaining your
                session or remembering preferences. We do not currently use
                third-party advertising or analytics cookies on our website. You
                can control cookies through your browser settings, though
                disabling certain cookies may affect site functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Choices and Rights
              </h2>
              <p className="mb-4">Depending on where you live, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing emails at any time</li>
                <li>
                  Object to or restrict certain processing of your information
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us using the
                information below. We will respond to your request within a
                reasonable timeframe and as required by applicable law.
              </p>
              <p className="mt-4">
                If you receive marketing emails from us, you may unsubscribe by
                following the link in those emails or by contacting us directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Security
              </h2>
              <p>
                We implement reasonable administrative, technical, and physical
                safeguards designed to protect your personal information.
                However, no method of transmission over the internet or
                electronic storage is completely secure, and we cannot guarantee
                absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Children&apos;s Privacy
              </h2>
              <p>
                Our website and services are not directed to individuals under
                the age of 18. We do not knowingly collect personal information
                from children. If you believe we have collected information from
                a child, please contact us and we will take steps to delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Third-Party Links
              </h2>
              <p>
                Our website may contain links to third-party websites. We are
                not responsible for the privacy practices or content of those
                sites. We encourage you to review the privacy policies of any
                third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. When we
                do, we will revise the &quot;Last updated&quot; date at the top
                of this page. We encourage you to review this policy
                periodically. Your continued use of our website or services after
                changes are posted constitutes your acceptance of the updated
                policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <ul className="space-y-2">
                <li>
                  <strong>Bsites.io</strong>
                </li>
                <li>75 Raymond Road, Plymouth, Massachusetts</li>
                <li>
                  Email:{" "}
                  <a
                    href="mailto:bsitesioteam@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    bsitesioteam@gmail.com
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a
                    href="tel:+17813367274"
                    className="text-blue-600 hover:underline"
                  >
                    +1 (781) 336-7274
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
