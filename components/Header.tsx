"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

export default function Header() {
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;

      if (scrollPosition > viewportHeight / 2) {
        setShowArrow(false);
      } else {
        setShowArrow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        <div className="text-center lg:text-left max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 font-['Rokiest'] tracking-wider">Carter Tran</h1>
          <p className="text-xl md:text-2xl mx-auto text-muted-foreground mb-12">
            Software engineer and data scientist with a passion for building elegant solutions to complex problems. Currently focused on
            machine learning and software development.
          </p>
        </div>
        <div className="hidden lg:block min-w-[256px]">
          <img
            src="/headshot.png"
            alt="Carter Tran"
            className="rounded-lg w-64 h-64 object-cover"
          />
        </div>
      </div>

      {showArrow && (
        <div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce z-10 transition-opacity duration-1000"
          aria-label="Scroll down"
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors"
          />
        </div>
      )}
    </>
  )
}
