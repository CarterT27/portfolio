"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAvatarContext } from "@/context/AvatarContext"
import Image from "next/image"
import { useTheme } from "next-themes"

// Determine the time of day variant to use
function getTimeVariant(
  forcedVariant?: 'day' | 'night' | 'sunrise_sunset',
  theme?: string | undefined,
  isClient: boolean = false
): 'day' | 'night' | 'sunrise_sunset' {
  // If a variant is forced (for testing), use it
  if (forcedVariant) {
    return forcedVariant;
  }

  // For SSR, return a stable value
  if (!isClient) {
    return 'day';
  }

  const hour = new Date().getHours();

  // Sunrise: 5-8 AM, Sunset: 5-8 PM
  if ((hour >= 5 && hour < 8) || (hour >= 17 && hour < 20)) {
    return 'sunrise_sunset';
  } else if (theme === 'light') {
    // Always use day background for light theme (except during sunrise/sunset)
    return 'day';
  } else if (theme === 'dark') {
    // Always use night background for dark theme (except during sunrise/sunset)
    return 'night';
  } else if (hour >= 8 && hour < 17) {
    // Fallback to time-based for system theme or when theme is not available
    return 'day';
  } else {
    // Fallback to time-based for system theme or when theme is not available
    return 'night';
  }
}

// Get the appropriate background image URL
function getBackgroundUrl(
  background: string | undefined, 
  forcedVariant?: 'day' | 'night' | 'sunrise_sunset',
  theme?: string,
  isClient: boolean = false
): string {
  const timeVariant = getTimeVariant(forcedVariant, theme, isClient);

  if (!background) {
    // Default background with time variant
    return `/avatar/geisel_${timeVariant}.png`;
  }

  // Extract base name without extension
  const baseNameMatch = background.match(/^(.+)\.([^.]+)$/);
  if (baseNameMatch) {
    const baseName = baseNameMatch[1];
    const extension = baseNameMatch[2];

    // Try to use time-variant version
    return `/avatar/${baseName}_${timeVariant}.${extension}`;
  }

  // For backgrounds without proper extension format or fallback
  return `/avatar/${background}`;
}

export default function Avatar() {
  const { avatarState } = useAvatarContext()
  const { resolvedTheme } = useTheme()
  const [bobPosition, setBobPosition] = useState(0)
  const [backgroundUrl, setBackgroundUrl] = useState<string>('/avatar/geisel_day.png') // Default to day variant for SSR
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  const [forcedTimeVariant, setForcedTimeVariant] = useState<'day' | 'night' | 'sunrise_sunset' | undefined>(undefined)
  const [bounceLayers, setBounceLayers] = useState<Record<number, boolean>>({})
  const [mounted, setMounted] = useState(false)

  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return;
    
    // Update background URL when avatarState changes or theme changes
    const newUrl = getBackgroundUrl(avatarState.background, forcedTimeVariant, resolvedTheme, true);
    setBackgroundUrl(newUrl)

    // Set fallback URLs in order of preference:
    // 1. Original background without time variant
    // 2. Default geisel background with time variant
    // 3. Default geisel background without time variant
    if (avatarState.background) {
      setFallbackUrl(`/avatar/${avatarState.background}`);
    } else {
      setFallbackUrl(`/avatar/geisel_${getTimeVariant(forcedTimeVariant, resolvedTheme, true)}.png`);
    }

    // Update background URL every minute to check for time changes
    const intervalId = setInterval(() => {
      setBackgroundUrl(getBackgroundUrl(avatarState.background, forcedTimeVariant, resolvedTheme, true))
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [avatarState.background, forcedTimeVariant, resolvedTheme, mounted])

  // Simple animation effect to replace the Pixi.js animation
  useEffect(() => {
    let animationFrameId: number
    let time = 0

    const animate = () => {
      time += 0.05
      setBobPosition(Math.sin(time) * 4)
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Handle image loading error
  const handleImageError = () => {
    if (fallbackUrl && backgroundUrl !== fallbackUrl) {
      setBackgroundUrl(fallbackUrl);
    } else if (fallbackUrl === `/avatar/${avatarState.background}`) {
      // If the original background fails, try the default geisel with time variant
      setBackgroundUrl(`/avatar/geisel_${getTimeVariant(forcedTimeVariant, resolvedTheme, true)}.png`);
    } else {
      // If all else fails, use the basic geisel
      setBackgroundUrl('/avatar/geisel.png');
    }
  };

  // Handle time variant selection
  const handleTimeVariantChange = (variant: 'day' | 'night' | 'sunrise_sunset' | 'auto') => {
    if (variant === 'auto') {
      setForcedTimeVariant(undefined);
    } else {
      setForcedTimeVariant(variant);
    }
  };

  // Toggle bounce for a specific layer
  const toggleBounceForLayer = (index: number) => {
    setBounceLayers(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Prevent hydration mismatch by using initial values until mounted
  if (!mounted) {
    return (
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-[min(100%,400px)] aspect-square bg-card/50 rounded-lg shadow-md border relative overflow-hidden">
          {/* Loading placeholder */}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-[min(100%,400px)] aspect-square bg-card/50 rounded-lg shadow-md border relative overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundUrl}
            alt=""
            fill
            className="object-cover"
            priority
            onError={handleImageError}
          />
        </div>

        {/* Character Layers - positioned with transform to allow for the bobbing animation */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {/* Render all avatar layers sorted by zIndex */}
          {avatarState.layers
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((layer, index) => {
              // Use the bounce property from the layer, or override with the debug toggle if available
              const shouldBounce = bounceLayers[index] !== undefined ? bounceLayers[index] : layer.bounce
              
              return (
                <div
                  key={`layer-${index}`}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${layer.x}px, ${layer.y}px)${shouldBounce ? ` translateY(${bobPosition}px)` : ''}`
                  }}
                >
                  <Image
                    src={`/avatar/${layer.image}`}
                    alt=""
                    width={layer.width}
                    height={layer.height}
                    className="pixelated"
                    priority
                  />
                </div>
              )
            })}
        </div>

        {/* Debug info showing current avatar state - positioned at the bottom */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-0 left-0 right-0 text-xs bg-background/80 p-2 rounded-b text-center z-20">
            <p>Background: {avatarState.background || 'none'}</p>
            <p>Using: {backgroundUrl.split('/').pop()}</p>
            <p>Layers: {avatarState.layers.length}</p>
            <p>Theme: {resolvedTheme || 'loading...'}</p>
            <p>Time variant: {getTimeVariant(forcedTimeVariant, resolvedTheme, true)}</p>

            {/* Time variant test controls */}
            <div className="mt-2 flex justify-center gap-1">
              <button
                onClick={() => handleTimeVariantChange('day')}
                className={`px-2 py-1 rounded text-xs ${forcedTimeVariant === 'day' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Day
              </button>
              <button
                onClick={() => handleTimeVariantChange('night')}
                className={`px-2 py-1 rounded text-xs ${forcedTimeVariant === 'night' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Night
              </button>
              <button
                onClick={() => handleTimeVariantChange('sunrise_sunset')}
                className={`px-2 py-1 rounded text-xs ${forcedTimeVariant === 'sunrise_sunset' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Sunrise/Sunset
              </button>
              <button
                onClick={() => handleTimeVariantChange('auto')}
                className={`px-2 py-1 rounded text-xs ${forcedTimeVariant === undefined ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Auto
              </button>
            </div>

            {/* Bounce toggle controls */}
            <div className="mt-2">
              <p className="text-xs font-semibold mb-1">Layer Bounce Toggles:</p>
              <div className="flex flex-wrap justify-center gap-1">
                {avatarState.layers
                  .slice()
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map((layer, index) => (
                    <button
                      key={`bounce-toggle-${index}`}
                      onClick={() => toggleBounceForLayer(index)}
                      className={`px-2 py-1 rounded text-xs ${
                        (bounceLayers[index] !== undefined ? bounceLayers[index] : layer.bounce) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {layer.image.split('.')[0]} ({index})
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
