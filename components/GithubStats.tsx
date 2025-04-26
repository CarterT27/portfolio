"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { faUsers, faUserPlus, faCodeBranch, faDatabase, faCode } from "@fortawesome/free-solid-svg-icons"
import { motion } from "framer-motion"
import type { GithubStats } from "@/types"

export default function GithubStats() {
  const [stats, setStats] = useState<GithubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGithubStats = async () => {
      try {
        const response = await fetch('https://api.github.com/users/CarterT27')
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`)
        }
        
        const data = await response.json()
        setStats({
          followers: data.followers,
          following: data.following,
          public_repos: data.public_repos,
          public_gists: data.public_gists
        })
      } catch (error) {
        console.error("Error fetching GitHub stats:", error)
        setError("Failed to load GitHub statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchGithubStats()
  }, [])

  if (loading) {
    return <div className="py-4 text-center">Loading GitHub stats...</div>
  }

  if (error || !stats) {
    return <div className="py-4 text-center text-muted-foreground">{error || "Unable to load GitHub statistics"}</div>
  }

  const statItems = [
    { icon: faUsers, label: "Followers", value: stats.followers },
    { icon: faUserPlus, label: "Following", value: stats.following },
    { icon: faCodeBranch, label: "Repositories", value: stats.public_repos },
    { icon: faCode, label: "Gists", value: stats.public_gists }
  ]

  return (
    <div className="py-6">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
        <FontAwesomeIcon icon={faGithub} className="h-6 w-6" />
        <span>GitHub Statistics</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
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