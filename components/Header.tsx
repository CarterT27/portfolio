"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

// Custom hook for typing effect
const useTypingEffect = (text: string, speed: number = 100) => {
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    // Reset state when component mounts
    setDisplayText("");
    setIsTypingComplete(false);
    setShowCursor(true);
    setIsAnimationComplete(false);

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(intervalId);

        // Make cursor blink three times after typing is complete
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
          setShowCursor(prev => !prev);
          blinkCount++;

          if (blinkCount >= 6) { // 3 full blinks (on/off = 2 counts)
            clearInterval(blinkInterval);
            setShowCursor(false);
            setIsAnimationComplete(true);
          }
        }, 500); // Blink every 500ms

        return () => clearInterval(blinkInterval);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return { displayText, isTypingComplete, showCursor, isAnimationComplete };
};

export default function Header() {
  const [showArrow, setShowArrow] = useState(true);
  const { displayText, isTypingComplete, showCursor, isAnimationComplete } = useTypingEffect("Carter Tran", 150);

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
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 md:px-8 lg:px-16">
        <div className="text-center lg:text-left max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 font-['Rokiest'] tracking-wider">
            <span className="inline-block min-w-[300px] sm:min-w-[350px] md:min-w-[400px] lg:min-w-[500px] text-left">
              {displayText}
              {showCursor && <span className="animate-pulse">|</span>}
            </span>
          </h1>
          <p className="text-xl md:text-2xl mx-auto text-muted-foreground mb-12">
            Tinkerer, builder, problem solver
          </p>
        </div>
        <div className="hidden lg:block min-w-[256px] max-h-[calc(100vh-4rem)] flex items-center justify-center">
          <img
            src="/hero.png"
            alt="Carter Tran"
            className="rounded-lg w-auto h-auto max-w-full max-h-[min(calc(100vh-4rem),600px)] object-contain"
          />
        </div>
      </div>

      {showArrow && isAnimationComplete && (
        <div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce z-10 transition-opacity duration-1000"
          aria-label="Scroll down"
          onClick={() => {
            const experienceSection = document.getElementById('experience');
            if (experienceSection) {
              experienceSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
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
