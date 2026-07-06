"use client";

import React from "react";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

/* Mini mock website rendered inside the device screens */
const MiniSite = ({ mobile = false }: { mobile?: boolean }) => (
  <div className="flex h-full w-full flex-col bg-paper">
    {/* Mini navbar */}
    <div
      className={`flex items-center justify-between border-b border-ink/10 ${
        mobile ? "px-2.5 py-2" : "px-4 py-2.5"
      }`}
    >
      <span
        className={`font-display font-semibold text-ink ${
          mobile ? "text-[8px]" : "text-[10px]"
        }`}
      >
        Bsites<span className="text-accent">.</span>
      </span>
      {mobile ? (
        <div className="flex flex-col gap-[2.5px]">
          <span className="block h-[1.5px] w-3 rounded bg-ink/70" />
          <span className="block h-[1.5px] w-3 rounded bg-ink/70" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {["Work", "Pricing", "Contact"].map((item) => (
            <span key={item} className="text-[7px] font-medium text-ink/60">
              {item}
            </span>
          ))}
          <span className="rounded-full bg-ink px-2 py-0.5 text-[6.5px] font-semibold text-paper">
            Start
          </span>
        </div>
      )}
    </div>

    {/* Mini hero */}
    <div className={`flex-1 ${mobile ? "px-2.5 pt-3" : "px-4 pt-4"}`}>
      <p
        className={`font-display font-medium leading-[1.05] tracking-tight text-ink ${
          mobile ? "text-[11px]" : "text-[15px]"
        }`}
      >
        Your business,
        <br />
        looking <em className="font-light italic text-accent">expensive</em>.
      </p>
      <div className={`${mobile ? "mt-1.5" : "mt-2"} space-y-1`}>
        <span
          className={`block h-[3px] rounded-full bg-ink/15 ${
            mobile ? "w-4/5" : "w-3/5"
          }`}
        />
        <span
          className={`block h-[3px] rounded-full bg-ink/15 ${
            mobile ? "w-3/5" : "w-2/5"
          }`}
        />
      </div>
      <div className={`flex items-center gap-1.5 ${mobile ? "mt-2.5" : "mt-3"}`}>
        <span
          className={`rounded-full bg-accent font-semibold text-paper ${
            mobile ? "px-2 py-1 text-[6px]" : "px-2.5 py-1 text-[6.5px]"
          }`}
        >
          Get started
        </span>
        <span
          className={`rounded-full border border-ink/20 font-medium text-ink/70 ${
            mobile ? "px-2 py-1 text-[6px]" : "px-2.5 py-1 text-[6.5px]"
          }`}
        >
          See work
        </span>
      </div>

      {/* Mini content cards */}
      <div
        className={`grid gap-1.5 ${
          mobile ? "mt-3 grid-cols-1" : "mt-4 grid-cols-3"
        }`}
      >
        {[
          "from-accent/90 to-accent/60",
          "from-aqua/90 to-aqua/50",
          "from-ink/80 to-ink/50",
        ].map((g, i) => (
          <div
            key={i}
            className={`rounded-md bg-gradient-to-br ${g} ${
              mobile ? "h-7" : "h-12"
            } ${mobile && i > 0 ? "hidden" : ""}`}
          />
        ))}
      </div>
    </div>
  </div>
);

const DeviceShowcase = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease, delay: 0.35 }}
      className="relative flex h-full min-h-[380px] items-center justify-center sm:min-h-[460px] lg:min-h-[520px]"
      style={{ perspective: "1600px" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3/4 w-3/4 rounded-full bg-gradient-radial from-accent/25 via-aqua/10 to-transparent blur-2xl" />
      </div>

      {/* MacBook */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[86%] max-w-[520px]"
        style={{
          transform: "rotateX(8deg) rotateY(-12deg) rotateZ(1deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Lid / screen */}
        <div className="relative rounded-t-xl bg-[#0e0b1c] p-[2.5%] pb-[1.5%] shadow-[0_40px_90px_-25px_rgba(26,20,51,0.6)] ring-1 ring-white/10">
          {/* Camera */}
          <span className="absolute left-1/2 top-[1.2%] h-1 w-1 -translate-x-1/2 rounded-full bg-ink/80 ring-1 ring-white/20" />
          <div className="aspect-[16/10] overflow-hidden rounded-md">
            <MiniSite />
          </div>
        </div>
        {/* Base / keyboard deck */}
        <div className="relative h-3 rounded-b-xl bg-gradient-to-b from-[#3a3450] to-[#211b38] sm:h-3.5">
          <span className="absolute left-1/2 top-0 h-1 w-[14%] -translate-x-1/2 rounded-b-md bg-[#161027]" />
        </div>
        <div className="mx-auto h-1 w-[70%] rounded-b-full bg-ink/30 blur-[1px]" />
      </motion.div>

      {/* iPhone */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
        className="absolute bottom-[4%] right-[2%] w-[24%] min-w-[96px] max-w-[140px] sm:right-[4%]"
        style={{
          transform: "rotateX(6deg) rotateY(14deg) rotateZ(-3deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative rounded-[1.4rem] bg-[#0e0b1c] p-[4.5%] shadow-[0_30px_60px_-15px_rgba(26,20,51,0.65)] ring-1 ring-white/10">
          {/* Dynamic island */}
          <span className="absolute left-1/2 top-[3.2%] z-10 h-[3.5%] w-[32%] -translate-x-1/2 rounded-full bg-[#0e0b1c]" />
          <div className="aspect-[9/19] overflow-hidden rounded-[1rem]">
            <MiniSite mobile />
          </div>
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.span
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
        className="absolute left-0 top-[10%] rounded-full border border-ink/10 bg-paper/90 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink shadow-lg backdrop-blur sm:left-[2%] sm:text-[11px]"
      >
        Desktop ready
      </motion.span>
      <motion.span
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.6,
        }}
        className="absolute bottom-[6%] left-[4%] rounded-full border border-ink/10 bg-ink px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper shadow-lg sm:text-[11px]"
      >
        Mobile friendly
      </motion.span>
    </motion.div>
  );
};

export default DeviceShowcase;
