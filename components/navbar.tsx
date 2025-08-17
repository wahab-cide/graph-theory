"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import React, { useState } from "react";

export const Navbar = () => {
  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "About",
      link: "/about",
    },
    {
      name: "Visualizer",
      link: "/visualizer",
    },
  ];

  return (
    <>
      <DesktopNav navItems={navItems} />
      <MobileNav navItems={navItems} />
    </>
  );
};

const DesktopNav = ({ navItems }: { navItems: { name: string; link: string }[] }) => {
  return (
    <>
      {/* Graph Theory Title - Left */}
      <Link 
        href="/" 
        className="hidden lg:block fixed top-6 left-6 z-50 text-white font-bold text-lg hover:text-blue-300 transition-colors"
      >
        Graph Theory
      </Link>
      
      {/* Centered Navigation */}
      <nav className="hidden lg:flex fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex flex-row items-center space-x-8 bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
          {navItems.map((navItem, idx) => (
            <Link
              key={`nav-item-${idx}`}
              className="text-white/90 hover:text-white transition-colors text-sm font-medium"
              href={navItem.link}
            >
              {navItem.name}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

const MobileNav = ({ navItems }: { navItems: { name: string; link: string }[] }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      {/* Graph Theory Title - Mobile */}
      <Link 
        href="/" 
        className="lg:hidden fixed top-6 left-6 z-50 text-white font-bold text-lg"
      >
        Graph Theory
      </Link>

      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-6 right-6 z-50 text-white/90 hover:text-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {open ? <IconX size={24} /> : <IconMenu2 size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-16 left-4 right-4 z-40 bg-black/90 backdrop-blur-md px-6 py-4 rounded-lg border border-white/10 flex flex-col gap-4"
          >
            {navItems.map((navItem, idx) => (
              <Link
                key={`link=${idx}`}
                href={navItem.link}
                onClick={() => setOpen(false)}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                {navItem.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
