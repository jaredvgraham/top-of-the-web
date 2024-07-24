import Image from "next/image";
import Hero from "../components/Hero";
import AboutMe from "@/components/AboutMe";
import WhyUs from "@/components/WhyUs";
import OurWork from "@/components/OurWork";
import Services from "@/components/Services";
import Process from "@/components/Process";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <OurWork />
      <WhyUs />
      <Process />
      <AboutMe />
    </>
  );
}
