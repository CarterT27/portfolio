"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types"
import { getProjects } from "@/lib/data"
import { useTheme } from "next-themes"

// Theme-aware image component that switches between dark and light variants
function ThemeAwareImage({ src, alt, className, scale }: { src: string; alt: string; className?: string; scale?: number }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply scaling if provided
  const scaleStyle = scale ? { transform: `scale(${scale})`, maxWidth: '100%', maxHeight: '100%' } : { maxWidth: '100%', maxHeight: '100%' };

  if (!mounted) return <img src={src} alt={alt} className={className} style={scaleStyle} />;

  // Check if this is a logo that needs a dark mode variant
  const isDarkTheme = resolvedTheme === 'dark';

  if (isDarkTheme) {
    // Check for PNG images
    if (src === '/logos/nextjs.png' || src === '/logos/atptour.png') {
      return <img src={`${src.replace('.png', '-white.png')}`} alt={alt} className={className} style={scaleStyle} />;
    }

    // Check for SVG images
    if (src === '/logos/txtTutor.svg') {
      return <img src="/logos/txtTutor-white.svg" alt={alt} className={className} style={scaleStyle} />;
    }
  }

  // Dark theme: use original applehealth logo, Light theme: use dark variant
  if (src === '/logos/applehealth.png') {
    return <img src={isDarkTheme ? src : "/logos/applehealth-dark.png"} alt={alt} className={className} style={scaleStyle} />;
  }

  return <img src={src} alt={alt} className={className} style={scaleStyle} />;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return <div className="py-12 text-center">Loading projects...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ProjectCard 
          key={index} 
          project={project} 
          index={index} 
          isExpanded={expandedCardIndex === index}
          setExpandedCardIndex={setExpandedCardIndex}
        />
      ))}
    </div>
  )
}

function ProjectCard({ 
  project, 
  index, 
  isExpanded, 
  setExpandedCardIndex 
}: { 
  project: Project; 
  index: number; 
  isExpanded: boolean; 
  setExpandedCardIndex: (index: number | null) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleInteraction = () => {
    setExpandedCardIndex(isExpanded ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleInteraction}
    >
      <Card className="h-full transition-all duration-300">
        <CardHeader className="p-4">
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>{project.summary}</CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded-md mb-4 relative">
            <ThemeAwareImage
              src={project.image || "/logos/nextjs.png"}
              alt={project.title}
              className="object-contain max-h-full"
              scale={project.imageScale}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isHovered || isExpanded ? 1 : 0,
              height: isHovered || isExpanded ? "auto" : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              {project.github && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (project.github) {
                      window.open(project.github, "_blank")
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faGithub} className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              )}

              {project.live && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (project.live) {
                      window.open(project.live, "_blank")
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-4 w-4 mr-2" />
                  Live Demo
                </Button>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
