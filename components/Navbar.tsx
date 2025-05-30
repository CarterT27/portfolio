"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "header", label: "Home" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [showNavbar, setShowNavbar] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("Home");
  const [isManualNavigation, setIsManualNavigation] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition > viewportHeight / 2) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }

      // Skip section detection if user just clicked a navigation item
      if (isManualNavigation) return;

      // Check if user has scrolled to bottom of the page
      const isAtBottom = window.innerHeight + window.pageYOffset >= documentHeight - 50;
      
      if (isAtBottom) {
        // If at the bottom, set current section to Contact
        setCurrentSection("Contact");
        return;
      }

      // Update current section based on scroll position
      const sections = navItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id),
        label: item.label
      }));

      const current = sections.find(section => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (current) {
        setCurrentSection(current.label);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isManualNavigation]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      // Immediately update current section based on clicked item
      const navItem = navItems.find(item => item.id === sectionId);
      if (navItem) {
        setCurrentSection(navItem.label);
      }

      // Set flag to ignore scroll detection temporarily
      setIsManualNavigation(true);

      const navbarHeight = document.querySelector('nav')?.clientHeight || 0;
      const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;

      window.scrollTo({
        top: sectionPosition - navbarHeight,
        behavior: 'smooth'
      });

      // Reset the flag after the scroll animation is likely complete
      setTimeout(() => {
        setIsManualNavigation(false);
      }, 2000);

      setIsDropdownOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showNavbar
          ? "bg-background/80 backdrop-blur-sm shadow-md py-4"
          : "bg-transparent py-6"
        }`}
    >
      <div className="max-w-screen-xl mx-auto px-6 md:px-8 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Mobile Dropdown */}
          <div className="relative md:hidden">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-sm font-medium text-foreground"
            >
              <span className="text-primary font-semibold">{currentSection}</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border">
                <div className="py-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-4 py-2 text-sm 
                        ${currentSection === item.label
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-primary/5"
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors
                    ${currentSection === item.label
                      ? "text-primary"
                      : showNavbar ? "text-foreground hover:text-primary" : "text-foreground/80 hover:text-primary"
                    }`}
                >
                  {item.label}
                </button>

                <AnimatePresence>
                  {currentSection === item.label && (
                    <motion.div
                      className="absolute bottom-[-8px] h-0.5 bg-primary rounded-full w-full"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}