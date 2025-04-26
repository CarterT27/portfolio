"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { faUsers, faUserPlus, faCodeBranch, faCode } from "@fortawesome/free-solid-svg-icons"
import { motion, useInView, animate } from "framer-motion"
import type { GithubStats } from "@/types"

// Fallback values if API fails
const FALLBACK_STATS: GithubStats = {
  followers: 38,
  following: 31,
  public_repos: 22,
  public_gists: 0
}

export default function GithubStats() {
  // For animated values display
  const [displayStats, setDisplayStats] = useState({
    followers: 0,
    following: 0,
    repos: 0,
    gists: 0
  })
  
  // For intersection observer
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true })
  
  // Refs for counting elements
  const followersRef = useRef<HTMLSpanElement>(null)
  const followingRef = useRef<HTMLSpanElement>(null)
  const reposRef = useRef<HTMLSpanElement>(null)
  const gistsRef = useRef<HTMLSpanElement>(null)
  
  // For storing actual stats
  const statsRef = useRef<GithubStats>(FALLBACK_STATS)
  
  // Fetch GitHub stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://api.github.com/users/CarterT27')
        if (response.ok) {
          const data = await response.json()
          statsRef.current = {
            followers: data.followers || FALLBACK_STATS.followers,
            following: data.following || FALLBACK_STATS.following,
            public_repos: data.public_repos || FALLBACK_STATS.public_repos,
            public_gists: data.public_gists || FALLBACK_STATS.public_gists
          }
        }
      } catch (error) {
        console.error("Error fetching GitHub stats:", error)
      }
    }
    
    fetchStats()
  }, [])
  
  // Run counting animation when stats are in view
  useEffect(() => {
    if (!isInView) return
    
    const stats = statsRef.current
    
    // Update display stats for rendering
    setDisplayStats({
      followers: stats.followers,
      following: stats.following,
      repos: stats.public_repos,
      gists: stats.public_gists
    })
  }, [isInView])
  
  // Stat items configuration
  const statItems = [
    { icon: faUsers, label: "Followers", value: displayStats.followers, ref: followersRef, countTo: statsRef.current.followers },
    { icon: faUserPlus, label: "Following", value: displayStats.following, ref: followingRef, countTo: statsRef.current.following },
    { icon: faCodeBranch, label: "Repositories", value: displayStats.repos, ref: reposRef, countTo: statsRef.current.public_repos },
    { icon: faCode, label: "Gists", value: displayStats.gists, ref: gistsRef, countTo: statsRef.current.public_gists }
  ]

  return (
    <div className="py-6" ref={containerRef}>
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
        <FontAwesomeIcon icon={faGithub} className="h-6 w-6" />
        <span>GitHub Statistics</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{
              y: -5,
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
          >
            <Card className="h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className="h-6 w-6 mb-2 text-primary"
                />
                <motion.p 
                  className="text-2xl font-bold"
                  initial={{ opacity: 1 }}
                  animate={isInView ? { 
                    transitionEnd: { 
                      opacity: 1 
                    } 
                  } : {}}
                  onAnimationStart={() => {
                    if (isInView) {
                      setTimeout(() => {
                        animate(0, item.countTo, {
                          duration: 1.5,
                          onUpdate: (value) => {
                            if (item.ref.current) {
                              item.ref.current.textContent = Math.round(value).toLocaleString();
                            }
                          }
                        });
                      }, index * 100);
                    }
                  }}
                >
                  <span ref={item.ref}>0</span>
                </motion.p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <a 
          href="https://github.com/CarterT27" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View GitHub Profile →
        </a>
      </div>
    </div>
  )
} 