"use client"

import type React from "react"

import { useEffect, useRef, useState, forwardRef } from "react"
import { motion } from "framer-motion"
import { useAvatarContext } from "@/context/AvatarContext"
import type { Experience } from "@/types"
import { getExperiences } from "@/lib/data"

export default function Timeline() {
  const { setCurrentExperience } = useAvatarContext()
  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])

  // Fetch experiences data
  useEffect(() => {
    const fetchExperiences = async () => {
      const data = await getExperiences()
      setExperiences(data)
    }

    fetchExperiences()
  }, [])

  // Set initial experience on first render
  useEffect(() => {
    if (experiences.length > 0) {
      setCurrentExperience(experiences[0], 0)
    }
  }, [experiences, setCurrentExperience])

  // Calculate which timeline item is closest to the center of the viewport
  useEffect(() => {
    if (experiences.length === 0) return

    const calculateClosestItem = () => {
      const viewportHeight = window.innerHeight
      const viewportCenter = viewportHeight / 2

      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      itemRefs.current.forEach((item, index) => {
        if (!item) return

        const rect = item.getBoundingClientRect()
        const itemCenter = rect.top + rect.height / 2
        const distance = Math.abs(itemCenter - viewportCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex)
        setCurrentExperience(experiences[closestIndex], closestIndex)
      }
    }

    // Calculate on mount and when scrolling
    calculateClosestItem()

    window.addEventListener("scroll", calculateClosestItem)
    window.addEventListener("resize", calculateClosestItem)

    return () => {
      window.removeEventListener("scroll", calculateClosestItem)
      window.removeEventListener("resize", calculateClosestItem)
    }
  }, [activeIndex, setCurrentExperience, experiences])

  if (experiences.length === 0) {
    return <div className="py-12 text-center">Loading experiences...</div>
  }

  return (
    <div className="relative">
      <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-border transform md:-translate-x-1/2"></div>

      <div className="space-y-12">
        {experiences.map((experience, index) => (
          <TimelineItem
            key={index}
            experience={experience}
            index={index}
            isActive={index === activeIndex}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Use React's forwardRef directly
const TimelineItem = forwardRef(function TimelineItem(
  {
    experience,
    index,
    isActive,
  }: {
    experience: Experience
    index: number
    isActive: boolean
  },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={`flex flex-col md:flex-row items-start md:items-center gap-4 ${
        index % 2 === 0 ? "md:flex-row-reverse" : ""
      }`}
    >
      <motion.div
        className={`flex-1 ${index % 2 === 0 ? "md:text-right" : ""}`}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div
          className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-300 relative z-10 ${
            isActive ? "ring-2 ring-primary ring-offset-2 scale-[1.02]" : ""
          }`}
        >
          <h3 className="text-xl font-bold">{experience.role}</h3>
          <h4 className="text-lg font-semibold text-primary">{experience.company}</h4>
          <p className="text-sm text-muted-foreground mb-2">{experience.date}</p>
          <p>{experience.description}</p>
        </div>
      </motion.div>

      <div className="flex items-center justify-center z-10">
        <div
          className={`w-8 h-8 rounded-full transition-colors duration-300 ${
            isActive ? "bg-primary" : "bg-muted"
          } flex items-center justify-center`}
        >
          <span className={`${isActive ? "text-primary-foreground" : "text-muted-foreground"} text-sm font-bold`}>
            {index + 1}
          </span>
        </div>
      </div>

      <div className="flex-1 hidden md:block"></div>
    </div>
  )
})

// Add display name for better debugging
TimelineItem.displayName = "TimelineItem"
