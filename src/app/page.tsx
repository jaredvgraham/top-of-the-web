import Image from "next/image";
import Hero from "../components/Hero";
import AboutMe from "@/components/AboutMe";
import WhyUs from "@/components/WhyUs";

export default function Home() {
  return (
    <>
      <Hero />
      <WhyUs />
      <AboutMe />
    </>
  );
}
