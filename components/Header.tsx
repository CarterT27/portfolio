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

// Define a type for the seagull object
type Seagull = {
  id: string; // Changed to string to support more complex IDs
  position: number;
  height: number;
  currentImage: number;
  direction: 'ltr' | 'rtl';
  isFlying: boolean;
};

// Generate a guaranteed unique ID
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function Header() {
  const [showArrow, setShowArrow] = useState(true);
  const [seagulls, setSeagulls] = useState<Seagull[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [isPopped, setIsPopped] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const animationFrameIds = useRef<Map<string, number>>(new Map());
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
    // Cleanup animation frames when component unmounts
    return () => {
      animationFrameIds.current.forEach((id) => {
        cancelAnimationFrame(id);
      });
    };
  }, []);

  const animateSeagull = (seagullId: string, time: number) => {
    let lastTime = time;
    const flySpeed = 4; // pixels per frame
    const flapInterval = 150; // milliseconds between flaps
    let lastFlapTime = 0;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Get hero element bounds
      const heroElement = heroRef.current;
      if (!heroElement) {
        setSeagulls(prev => prev.filter(s => s.id !== seagullId));
        animationFrameIds.current.delete(seagullId);
        return;
      }

      const heroRect = heroElement.getBoundingClientRect();
      const heroWidth = heroRect.width;

      setSeagulls(prev => {
        const seagull = prev.find(s => s.id === seagullId);
        if (!seagull || !seagull.isFlying) {
          // If seagull doesn't exist anymore, stop animation
          animationFrameIds.current.delete(seagullId);
          return prev;
        }

        // Move seagull based on direction
        const newPosition = seagull.direction === 'ltr'
          ? seagull.position + flySpeed  // Moving right
          : seagull.position - flySpeed; // Moving left

        // Check if animation should stop based on direction
        if ((seagull.direction === 'ltr' && newPosition > heroWidth) ||
            (seagull.direction === 'rtl' && newPosition < -50)) {
          // Remove this seagull from the array
          animationFrameIds.current.delete(seagullId);
          return prev.filter(s => s.id !== seagullId);
        }

        // Flap wings if it's time
        let newImage = seagull.currentImage;
        if (currentTime - lastFlapTime > flapInterval) {
          newImage = seagull.currentImage === 1 ? 2 : 1;
          lastFlapTime = currentTime;
        }

        // Update this seagull in the array
        return prev.map(s => s.id === seagullId ? {
          ...s,
          position: newPosition,
          currentImage: newImage
        } : s);
      });

      // Continue animation only if this specific ID is still in the map
      if (animationFrameIds.current.has(seagullId)) {
        const frameId = requestAnimationFrame(animate);
        animationFrameIds.current.set(seagullId, frameId);
      }
    };

    const frameId = requestAnimationFrame(animate);
    animationFrameIds.current.set(seagullId, frameId);
  };

  const spawnNewSeagull = () => {
    // Generate random height between 5% and 20%
    const randomHeight = Math.floor(Math.random() * 16) + 5;
    
    // Randomly choose direction
    const randomDirection = Math.random() > 0.5 ? 'ltr' : 'rtl';
    
    // Set initial position based on direction
    let initialPosition;
    if (randomDirection === 'ltr') {
      initialPosition = -50; // Start from left
    } else {
      // Get hero width for right-to-left positioning
      const heroWidth = heroRef.current?.getBoundingClientRect().width || 300;
      initialPosition = heroWidth + 50; // Start from right
    }

    // Generate a completely unique ID using timestamp and random string
    const seagullId = generateUniqueId();

    const newSeagull: Seagull = {
      id: seagullId,
      position: initialPosition,
      height: randomHeight,
      currentImage: 1,
      direction: randomDirection,
      isFlying: true
    };

    // Add new seagull to state and start animation
    setSeagulls(prev => [...prev, newSeagull]);
    animateSeagull(seagullId, performance.now());
  };

  const handleHeroClick = (e: React.MouseEvent) => {
    if (isPopped) return;
    
    // Get the new count directly
    const newCount = clickCount + 1;
    
    // Update the click count
    setClickCount(newCount);
    
    // Handle logic based on count
    // Temporarily disable popping effect
    // if (newCount >= 5) {
    //   setIsPopped(true);
    // } else {
      // Spawn a new seagull on every click (no limit)
      spawnNewSeagull();
    // }
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
          className={`relative hidden lg:block min-w-[256px] max-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden ${
            isPopped ? 'hidden' : ''
          }`}
        >
          {/* Render all active seagulls */}
          {seagulls.map((seagull) => (
            <img
              key={seagull.id}
              src={`/avatar/seagull_flap${seagull.currentImage}.png`}
              alt="Seagull"
              className="absolute w-16 h-16 object-contain z-20"
              style={{
                top: `${seagull.height}%`,
                left: `${seagull.position}px`,
                transform: `translateY(-50%) scaleX(${seagull.direction === 'rtl' ? -1 : 1})`,
                pointerEvents: 'none'
              }}
            />
          ))}

          <img
            src="/hero.png"
            alt="Carter Tran"
            className={`rounded-lg w-auto h-auto max-w-full max-h-[min(calc(100vh-4rem),600px)] object-contain cursor-pointer transition-transform duration-300 ${
              isPopped ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
            }`}
            onClick={handleHeroClick}
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
