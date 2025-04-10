"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";

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
  const [isSeagullFlying, setIsSeagullFlying] = useState(false);
  const [seagullPosition, setSeagullPosition] = useState(-50);
  const [seagullHeight, setSeagullHeight] = useState(5);
  const [currentSeagullImage, setCurrentSeagullImage] = useState(1);
  const [flyDirection, setFlyDirection] = useState<'ltr' | 'rtl'>('ltr'); // left-to-right or right-to-left
  const animationRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (isSeagullFlying) {
      let lastTime = performance.now();
      const flySpeed = 4; // pixels per frame
      const flapInterval = 150; // milliseconds between flaps
      let lastFlapTime = 0;

      const animate = (time: number) => {
        const deltaTime = time - lastTime;
        lastTime = time;

        // Get hero element bounds
        const heroElement = heroRef.current;
        if (!heroElement) {
          setIsSeagullFlying(false);
          return;
        }

        const heroRect = heroElement.getBoundingClientRect();
        const heroWidth = heroRect.width;

        // Move seagull based on direction
        setSeagullPosition(prev => {
          // Calculate new position based on direction
          const newPosition = flyDirection === 'ltr'
            ? prev + flySpeed  // Moving right
            : prev - flySpeed; // Moving left

          // Check if animation should stop based on direction
          if ((flyDirection === 'ltr' && newPosition > heroWidth) ||
            (flyDirection === 'rtl' && newPosition < -50)) {
            setIsSeagullFlying(false);
            cancelAnimationFrame(animationRef.current as number);
            return flyDirection === 'ltr' ? -50 : heroWidth + 50; // Reset position for next time
          }
          return newPosition;
        });

        // Flap wings
        if (time - lastFlapTime > flapInterval) {
          setCurrentSeagullImage(prev => prev === 1 ? 2 : 1);
          lastFlapTime = time;
        }

        // Continue animation only if still flying
        if (isSeagullFlying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isSeagullFlying, flyDirection]);

  const handleSeagullClick = () => {
    // Generate random height between 5% and 20%
    const randomHeight = Math.floor(Math.random() * 16) + 5;
    setSeagullHeight(randomHeight);

    // Randomly choose direction
    const randomDirection = Math.random() > 0.5 ? 'ltr' : 'rtl';
    setFlyDirection(randomDirection);

    // Set initial position based on direction
    if (randomDirection === 'ltr') {
      setSeagullPosition(-50); // Start from left
    } else {
      // Get hero width for right-to-left positioning
      const heroWidth = heroRef.current?.getBoundingClientRect().width || 300;
      setSeagullPosition(heroWidth + 50); // Start from right
    }

    setIsSeagullFlying(true);
  };

  return (
    <>
      <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 md:px-8 lg:px-16">
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

        <div
          ref={heroRef}
          className="relative hidden lg:block min-w-[256px] max-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden"
        >
          {/* Only show seagull when it's flying */}
          {isSeagullFlying && (
            <img
              src={`/avatar/seagull_flap${currentSeagullImage}.png`}
              alt="Seagull"
              className="absolute w-16 h-16 object-contain z-20"
              style={{
                top: `${seagullHeight}%`,
                left: `${seagullPosition}px`,
                transform: `translateY(-50%) scaleX(${flyDirection === 'rtl' ? -1 : 1})`, // Flip image for rtl
                pointerEvents: 'none' // Prevent seagull from interfering with clicks
              }}
            />
          )}

          <img
            src="/hero.png"
            alt="Carter Tran"
            className="rounded-lg w-auto h-auto max-w-full max-h-[min(calc(100vh-4rem),600px)] object-contain cursor-pointer"
            onClick={handleSeagullClick}
            title="Click for a surprise"
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
