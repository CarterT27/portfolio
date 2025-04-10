"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { AvatarState, Experience } from "@/types"

interface AvatarContextType {
  avatarState: AvatarState
  currentExperienceIndex: number | null
  setCurrentExperience: (experience: Experience, index?: number) => void
}

const defaultAvatarState: AvatarState = {
  layers: [
  ],
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined)

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarState, setAvatarState] = useState<AvatarState>(defaultAvatarState)
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState<number | null>(null)

  // Combine both state updates into a single function to prevent multiple renders
  const setCurrentExperience = useCallback((experience: Experience, index?: number) => {
    if (experience.avatar_state) {
      setAvatarState(experience.avatar_state)
    }

    if (index !== undefined) {
      setCurrentExperienceIndex(index)
    }
  }, [])

  return (
    <AvatarContext.Provider
      value={{
        avatarState,
        currentExperienceIndex,
        setCurrentExperience,
      }}
    >
      {children}
    </AvatarContext.Provider>
  )
}

export function useAvatarContext() {
  const context = useContext(AvatarContext)
  if (context === undefined) {
    throw new Error("useAvatarContext must be used within an AvatarProvider")
  }
  return context
}
