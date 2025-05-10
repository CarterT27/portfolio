"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function MetaNavbar() {
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setShowNavbar(true);
      } else {
        setShowNavbar(true); // Always show on meta page
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showNavbar
          ? "bg-background/80 backdrop-blur-sm shadow-md py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-8 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <div className="relative">
              <Link
                href="/"
                className="text-sm font-medium transition-colors text-foreground hover:text-primary"
              >
                Home
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
} 