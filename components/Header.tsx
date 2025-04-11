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

// Custom hook for cycling through blurbs with typing/deleting effects
const useBlurbCycler = (blurbs: string[], shouldStart: boolean, typingSpeed: number = 50, deletingSpeed: number = 30, pauseDuration: number = 3000) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize animation when shouldStart becomes true
  useEffect(() => {
    if (shouldStart && !isRunning) {
      setIsRunning(true);
    }
  }, [shouldStart, isRunning]);

  // Main animation effect, depends on isRunning instead of shouldStart
  useEffect(() => {
    // Only start animation if isRunning is true
    if (!isRunning) return;

    let timer: NodeJS.Timeout;

    if (isDeleting) {
      // Deleting phase
      if (displayText.length === 0) {
        // When fully deleted, move to the next blurb and start typing
        const nextIndex = (currentIndex + 1) % blurbs.length;
        setCurrentIndex(nextIndex);
        setIsDeleting(false);
      } else {
        // Continue deleting one character at a time
        timer = setTimeout(() => {
          setDisplayText(prev => prev.substring(0, prev.length - 1));
        }, deletingSpeed);
      }
    } else {
      // Typing phase
      const fullText = blurbs[currentIndex];

      if (displayText === fullText) {
        // When fully typed, pause before starting to delete
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      } else {
        // Continue typing one character at a time
        timer = setTimeout(() => {
          setDisplayText(fullText.substring(0, displayText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [blurbs, currentIndex, displayText, isDeleting, deletingSpeed, typingSpeed, pauseDuration, isRunning]);

  return { displayText, currentBlurb: blurbs[currentIndex], currentIndex, isDeleting };
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

// Define a type for pixel particles
type Pixel = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  settled: boolean;
};

// Generate a guaranteed unique ID
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Linear Congruential Generator implementation
  next(): number {
    // Constants for the LCG algorithm (same as Java's implementation)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    // Update the seed
    this.seed = (a * this.seed + c) % m;
    
    // Return a value between 0 and 1
    return this.seed / m;
  }
  
  // Get a random integer between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min) + min);
  }
}

export default function Header() {
  const [showArrow, setShowArrow] = useState(true);
  const [seagulls, setSeagulls] = useState<Seagull[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [isPopped, setIsPopped] = useState(false);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [isExploding, setIsExploding] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [sampledColors, setSampledColors] = useState<string[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const pixelContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameIds = useRef<Map<string, number>>(new Map());
  const pixelsRef = useRef<Pixel[]>([]);
  const { displayText: nameText, isTypingComplete: isNameTypingComplete, showCursor: nameShowCursor, isAnimationComplete } = useTypingEffect("Carter Tran", 150);

  // Keep the pixels ref in sync with state
  useEffect(() => {
    pixelsRef.current = pixels;
  }, [pixels]);

  // Track scroll position for pixel rendering optimization
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // State to track if blurb animation should start
  const [shouldStartBlurbAnimation, setShouldStartBlurbAnimation] = useState(false);

  // Effect to trigger blurb animation after name animation completes
  useEffect(() => {
    if (isAnimationComplete) {
      setShouldStartBlurbAnimation(true);
    }
  }, [isAnimationComplete]);

  // Array of possible blurbs
  const blurbs = [
    "Tinkerer, builder, problem solver",
    "ML engineer, data scientist, researcher",
    "Transforming data into meaningful insights",
    "Building scalable and performant software solutions",
    "Cars, code, and culinary adventures",
    "On the lookout for the next big thing"
  ];

  // Memoize the blurb array to prevent unnecessary rerenders
  const memoizedBlurbs = useRef(blurbs).current;

  // Use the blurb cycler hook with the shouldStart condition
  const { displayText: blurbText } = useBlurbCycler(memoizedBlurbs, shouldStartBlurbAnimation, 50, 30, 3000);

  // Find the longest blurb for sizing
  const longestBlurb = memoizedBlurbs.reduce((a, b) => a.length > b.length ? a : b, "");

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

  // Handle pixel animation
  useEffect(() => {
    if (!isExploding || pixels.length === 0) return;

    const gravity = 0.8;
    const friction = 0.99;
    
    // Don't use React state for animation updates - use the ref directly
    let currentPixels = [...pixelsRef.current];
    let animationRunning = true;
    let lastTime = performance.now();
    let rafId: number;
    let updateCounter = 0;

    // Function to update all pixels in a single frame
    const animatePixels = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (!animationRunning) return;

      let anyPixelMoving = false;
      updateCounter++;

      // Get viewport bounds
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const screenBottom = window.scrollY + viewportHeight + 100; // Add a buffer

      // Update each pixel position
      for (let i = 0; i < currentPixels.length; i++) {
        const pixel = currentPixels[i];
        
        // Skip if already settled
        if (pixel.settled) continue;

        // Apply gravity and friction
        let newVelocityY = pixel.velocityY + gravity;
        let newVelocityX = pixel.velocityX * friction;
        let newY = pixel.y + newVelocityY;
        let newX = pixel.x + newVelocityX;
        let newRotation = pixel.rotation + pixel.rotationSpeed;
        let isSettled = false;

        // Check if pixel is off-screen - mark as settled if it is
        if (newY > screenBottom || 
            newX < -100 || 
            newX > viewportWidth + 100) {
          isSettled = true;
        }

        // Update pixel with new values
        currentPixels[i] = {
          ...pixel,
          x: newX,
          y: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY,
          rotation: newRotation,
          settled: isSettled
        };

        // Check if any pixel is still moving
        if (!isSettled) {
          anyPixelMoving = true;
        }
      }

      // Only update React state every few frames to avoid performance issues
      if (updateCounter % 3 === 0 || !anyPixelMoving) {
        setPixels([...currentPixels]);
      }

      // Continue animation if any pixel is still moving
      if (anyPixelMoving) {
        rafId = requestAnimationFrame(animatePixels);
      } else {
        animationRunning = false;
        console.log("All pixels settled or disappeared");
      }
    };
    
    // Start the animation
    rafId = requestAnimationFrame(animatePixels);

    // Cleanup function
    return () => {
      animationRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isExploding]); // Only depend on isExploding, not pixels.length

  // Debug: log state changes
  useEffect(() => {
    console.log('State changed - clickCount:', clickCount, 'isPopped:', isPopped, 'pixels:', pixels.length);
  }, [clickCount, isPopped, pixels.length]);

  // Utility function to sample colors from an image
  const sampleColorsFromImage = (imageElement: HTMLImageElement, sampleCount: number, random: SeededRandom): string[] => {
    // Create an off-screen canvas to draw and sample from the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return getDefaultColors();

    // Set canvas dimensions based on image (can be smaller for performance)
    const maxDimension = 200; // Limit size for performance
    const scaleFactor = Math.min(1, maxDimension / Math.max(imageElement.width, imageElement.height));
    
    canvas.width = imageElement.width * scaleFactor;
    canvas.height = imageElement.height * scaleFactor;
    
    // Draw the image on the canvas
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Sample pixels from the image data
    const colors: string[] = [];
    const totalPixels = canvas.width * canvas.height;
    
    // Deterministic sampling using fixed intervals instead of random selection
    // This ensures we always get the same colors from the same image
    const sampleEvery = Math.max(1, Math.floor(totalPixels / sampleCount));
    const startOffset = random.nextInt(0, sampleEvery); // Random but deterministic starting point
    
    for (let pixelIndex = startOffset; pixelIndex < totalPixels; pixelIndex += sampleEvery) {
      const i = pixelIndex * 4; // Convert to RGBA array index
      
      if (i + 3 >= pixels.length) continue; // Skip if out of bounds
      
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Convert to hex - ensure two digits for each component
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colors.push(hex);
      
      if (colors.length >= sampleCount) break;
    }
    
    // If we couldn't get enough samples, fill with defaults
    if (colors.length < sampleCount) {
      const defaultColors = getDefaultColors();
      // Add default colors in a deterministic pattern
      for (let i = 0; i < sampleCount - colors.length; i++) {
        colors.push(defaultColors[i % defaultColors.length]);
      }
    }
    
    return colors;
  };
  
  // Fallback colors if sampling fails
  const getDefaultColors = (): string[] => {
    return [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
      '#F472B6', '#84CC16', '#0EA5E9', '#A855F7'
    ];
  };

  const createExplosion = () => {
    // Get hero element dimensions for pixel generation
    const heroElement = heroRef.current?.querySelector('img') as HTMLImageElement | null;
    if (!heroElement) return;

    const rect = heroElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Sample colors from the hero image
    const numPixels = 120; // Increase number of pixels since they'll be smaller
    let imageColors: string[] = [];
    
    // Create a seeded random generator using a hash of the image src
    // This ensures consistent results for the same image
    const imageSrcHash = heroElement.src.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = new SeededRandom(imageSrcHash);
    
    // Only attempt to sample if the image is loaded
    if (heroElement.complete && heroElement.naturalWidth > 0) {
      try {
        // Use a fixed number of colors to ensure determinism
        imageColors = sampleColorsFromImage(heroElement, 50, random);
        // Store sampled colors for debugging (only in dev mode)
        if (process.env.NODE_ENV === 'development') {
          setSampledColors(imageColors);
        }
      } catch (error) {
        console.error('Error sampling colors from image:', error);
        imageColors = getDefaultColors();
        if (process.env.NODE_ENV === 'development') {
          setSampledColors(imageColors);
        }
      }
    } else {
      imageColors = getDefaultColors();
      if (process.env.NODE_ENV === 'development') {
        setSampledColors(imageColors);
      }
    }
    
    const newPixels: Pixel[] = [];
    
    // Set a consistent pixel size
    const pixelSize = 6; // Fixed size for all pixels
    
    // Pre-generate all random values to ensure determinism
    const pixelData = [];
    for (let i = 0; i < numPixels; i++) {
      pixelData.push({
        angle: random.next() * Math.PI * 2,
        force: 10 + random.next() * 25,
        colorIndex: random.nextInt(0, imageColors.length),
        randomOffset1: 0.5 + random.next(),
        randomOffset2: 0.5 + random.next(),
        rotation: random.next() * 360,
        rotationSpeed: random.next() * 15 - 7.5
      });
    }
    
    // Create the pixels using the pre-generated random values
    for (let i = 0; i < numPixels; i++) {
      const data = pixelData[i];
      
      newPixels.push({
        id: generateUniqueId(),
        x: centerX,
        y: centerY,
        size: pixelSize,
        color: imageColors[data.colorIndex],
        velocityX: Math.cos(data.angle) * data.force * data.randomOffset1,
        velocityY: Math.sin(data.angle) * data.force * data.randomOffset2 - 20,
        rotation: data.rotation,
        rotationSpeed: data.rotationSpeed,
        settled: false
      });
    }
    
    setPixels(newPixels);
    setIsExploding(true);
  };

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
    
    // Log click for debugging
    console.log('Hero clicked, count:', newCount);

    // Update the click count
    setClickCount(newCount);

    // Handle logic based on count
    if (newCount >= 20) {
      console.log('Explosion triggered!');
      setIsPopped(true);
      // Use setTimeout to ensure state updates before explosion
      setTimeout(() => {
        createExplosion();
      }, 10);
    } else {
      // Spawn a new seagull on every click (no limit)
      spawnNewSeagull();
    }
  };

  return (
    <>
      <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 md:px-8 lg:px-16">
        <div className="text-center lg:text-left max-w-2xl w-full">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 font-['Rokiest'] tracking-wider">
            <span className="inline-block min-w-[300px] sm:min-w-[350px] md:min-w-[400px] lg:min-w-[500px] text-left">
              {nameText}
              {nameShowCursor && <span className="animate-pulse">|</span>}
            </span>
          </h1>
          <p className="text-xl md:text-2xl mx-auto text-muted-foreground mb-12 h-[1.5em] relative w-full">
            <span className="absolute opacity-0 select-none" aria-hidden="true">
              {longestBlurb}
            </span>
            <span className="absolute left-0 right-0 text-center lg:text-left">
              {blurbText}{shouldStartBlurbAnimation && <span className="animate-pulse">|</span>}
            </span>
          </p>
        </div>

        <div
          ref={heroRef}
          className={`relative lg:block min-w-[256px] max-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden`}
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
            className={`rounded-lg w-auto h-auto max-w-full max-h-[min(calc(100vh-4rem),600px)] object-contain cursor-pointer transition-transform duration-300 ${isPopped ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            onClick={handleHeroClick}
            title="Click for a surprise"
          />
        </div>
      </div>

      {/* Pixel explosion container (absolutely positioned to cover the whole document) */}
      {isExploding && (
        <div 
          ref={pixelContainerRef}
          className="fixed pointer-events-none z-[100]"
          style={{ 
            overflow: 'visible',
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0
          }}
        >
          {/* Only render pixels within the viewport */}
          {pixels.filter(pixel => {
            // Get the current scroll position
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            
            // Only render pixels that are visible in the viewport
            return pixel.y < (scrollY + viewportHeight + 100) && // Don't render too far below
                   pixel.y > (scrollY - 100) && // Don't render too far above
                   pixel.x > -100 && // Don't render too far left
                   pixel.x < window.innerWidth + 100; // Don't render too far right
          }).map(pixel => (
            <div
              key={pixel.id}
              className="absolute rounded-sm"
              style={{
                left: 0,
                top: 0,
                width: `${pixel.size}px`,
                height: `${pixel.size}px`,
                backgroundColor: pixel.color,
                transform: `translate3d(${pixel.x}px, ${pixel.y}px, 0) rotate(${pixel.rotation}deg)`,
                willChange: 'transform',
                position: 'absolute'
              }}
            />
          ))}
        </div>
      )}

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

      {/* Debugging: Color Palette Display - only shown in development mode */}
      {process.env.NODE_ENV === 'development' && isExploding && sampledColors.length > 0 && (
        <div 
          className="fixed bottom-4 left-4 z-[200] bg-black/70 p-3 rounded-lg"
          style={{
            maxWidth: '80vw',
            overflow: 'auto'
          }}
        >
          <div className="text-xs text-white mb-2">Debug: Sampled Colors ({sampledColors.length})</div>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {sampledColors.map((color, index) => (
              <div 
                key={index} 
                className="w-6 h-6 rounded border border-white/30"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
