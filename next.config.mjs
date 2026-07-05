/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/pricing/starter-website-package",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/pricing/standard-website-package",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/pricing/advanced-website-package",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/pricing/enterprise-website-package",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/pricing/e-commerce-website-package",
        destination: "/pricing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
