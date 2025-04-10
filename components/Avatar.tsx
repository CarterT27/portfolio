"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAvatarContext } from "@/context/AvatarContext"
import Image from "next/image"

// Determine the time of day variant to use
function getTimeVariant(forcedVariant?: 'day' | 'night' | 'sunrise_sunset'): 'day' | 'night' | 'sunrise_sunset' {
  // If a variant is forced (for testing), use it
  if (forcedVariant) {
    return forcedVariant;
  }

  const hour = new Date().getHours();

  // Sunrise: 5-8 AM, Sunset: 5-8 PM
  if ((hour >= 5 && hour < 8) || (hour >= 17 && hour < 20)) {
    return 'sunrise_sunset';
  } else if (hour >= 8 && hour < 17) {
    return 'day';
  } else {
    return 'night';
  }
}

// Get the appropriate background image URL
function getBackgroundUrl(background: string | undefined, forcedVariant?: 'day' | 'night' | 'sunrise_sunset'): string {
  const timeVariant = getTimeVariant(forcedVariant);

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
  const [bobPosition, setBobPosition] = useState(0)
  // Initialize with a valid URL based on current state and time
  const [backgroundUrl, setBackgroundUrl] = useState<string>(() =>
    getBackgroundUrl(avatarState.background)
  )
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  // For testing time variants
  const [forcedTimeVariant, setForcedTimeVariant] = useState<'day' | 'night' | 'sunrise_sunset' | undefined>(undefined)

  useEffect(() => {
    // Update background URL when avatarState changes
    const newUrl = getBackgroundUrl(avatarState.background, forcedTimeVariant);
    setBackgroundUrl(newUrl)

    // Reset fallback when primary URL changes
    setFallbackUrl(avatarState.background ? `/avatar/${avatarState.background}` : `/avatar/geisel.png`)

    // Update background URL every minute to check for time changes
    const intervalId = setInterval(() => {
      setBackgroundUrl(getBackgroundUrl(avatarState.background, forcedTimeVariant))
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [avatarState.background, forcedTimeVariant])

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

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-[300px] h-[300px] bg-card/50 rounded-lg shadow-md border relative overflow-hidden">
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
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ transform: `translateY(${bobPosition}px)` }}
        >
          {/* Render all avatar layers sorted by zIndex */}
          {avatarState.layers
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((layer, index) => (
              <div
                key={`layer-${index}`}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${layer.x}px, ${layer.y}px)`
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
            ))}
        </div>

        {/* Debug info showing current avatar state - positioned at the bottom */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-0 left-0 right-0 text-xs bg-background/80 p-2 rounded-b text-center z-20">
            <p>Background: {avatarState.background || 'none'}</p>
            <p>Using: {backgroundUrl.split('/').pop()}</p>
            <p>Layers: {avatarState.layers.length}</p>
            <p>Time variant: {getTimeVariant(forcedTimeVariant)}</p>

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
          </div>
        )}
      </div>
    </motion.div>
  )
}
