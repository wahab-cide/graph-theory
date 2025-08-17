"use client";
import React from "react";
import { motion } from "motion/react";

export function Hero() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 bg-black">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-6xl font-bold text-white"
      >
        Graph Theory
      </motion.h1>
    </div>
  );
}
