"use client"

import Link from "next/link"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import data from "@/app/data.json"
import MagnetLines from "@/components/MagnetLines"
import FeedbackForm from "@/components/FeedbackForm"
import type { PostMeta } from "@/lib/mdx"

type HomeClientProps = {
  recentPosts: PostMeta[]
}

export default function HomeClient({ recentPosts }: HomeClientProps) {
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState("")
  const [visibleProjects, setVisibleProjects] = useState(3)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const [mounted, setMounted] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  const hasThoughts = recentPosts.length > 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      sectionsRef.current.forEach((section) => {
        if (section && !section.classList.contains("animate-fade-in-up")) {
          section.classList.add("animate-fade-in-up")
        }
      })
    }, 100)

    if (typeof IntersectionObserver === "undefined") {
      sectionsRef.current.forEach((section) => {
        if (section) {
          section.classList.add("animate-fade-in-up")
        }
      })
      return () => clearTimeout(fallbackTimer)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => {
      clearTimeout(fallbackTimer)
      observer.disconnect()
    }
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const loadMoreProjects = () => {
    setVisibleProjects((prev) => prev + 3)
  }

  const parseMarkdown = (text: string) => {
    const elements: React.ReactNode[] = []
    // Match **bold** and [text](url)
    const regex = /(\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\))/g
    let lastIndex = 0
    let match
    let key = 0

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>)
      }
      if (match[2]) {
        // Bold
        elements.push(
          <span key={key++} className="text-foreground">
            {match[2]}
          </span>
        )
      } else if (match[3] && match[4]) {
        // Link
        elements.push(
          <a key={key++} href={match[4]} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors duration-300">
            {match[3]}
          </a>
        )
      }
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) {
      elements.push(<span key={key++}>{text.slice(lastIndex)}</span>)
    }
    return elements
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      <div className="fixed inset-0 hidden lg:flex items-center justify-center pointer-events-none z-0 opacity-[0.09]">
        <MagnetLines
          rows={9}
          columns={9}
          containerSize="100vw"
          lineColor="gray"
          lineWidth="0.8vmin"
          lineHeight="5vmin"
          baseAngle={0}
          style={{ height: '100vh' }}
        />
      </div>
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {["intro", "work", "projects", ...(hasThoughts ? ["thoughts"] : []), "connect"].map((section) => (
            <button
              key={section}
              onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
              className={`w-2 h-8 rounded-full transition-all duration-500 cursor-pointer ${
                activeSection === section ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Navigate to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        <header
          id="intro"
          ref={(el) => {
            sectionsRef.current[0] = el
          }}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">
                  {data.intro.subtitle} / {new Date().getFullYear()}
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                  {data.name.split(" ")[0]}
                  <br />
                  <span className="text-muted-foreground">{data.name.split(" ")[1]}</span>
                </h1>
              </div>

              <div className="space-y-6 max-w-md">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  {parseMarkdown(data.intro.description)}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {data.intro.status}
                  </div>
                  <div className="hidden sm:block text-muted-foreground/50">•</div>
                  <div>{data.intro.location}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-row lg:flex-col justify-end gap-6 sm:gap-8 mt-8 lg:mt-0">
              <div className="space-y-4 flex-1">
                <div className="text-sm text-muted-foreground font-mono">CURRENTLY</div>
                <div className="space-y-2">
                  <div className="text-foreground">{data.current.role}</div>
                  <div className="text-muted-foreground">{data.current.company}</div>
                  <div className="text-xs text-muted-foreground">{data.current.period}</div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="text-sm text-muted-foreground font-mono">FOCUS</div>
                <div className="flex flex-col gap-1">
                  {data.focus.map((skill) => (
                    <span
                      key={skill}
                      className="text-sm text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section
          id="work"
          ref={(el) => {
            sectionsRef.current[1] = el
          }}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">Selected Work</h2>
              <div className="text-sm text-muted-foreground font-mono">2019 — {new Date().getFullYear()}</div>
            </div>

            <div className="space-y-8 sm:space-y-12">
              {data.work.filter((job) => job.enabled !== false).map((job, index) => (
                <div
                  key={index}
                  className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500"
                >
                  <div className="lg:col-span-2">
                    <div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                      {job.year}
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium">{job.company}</h3>
                      <div className="text-muted-foreground">{job.role}</div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-lg">{parseMarkdown(job.description)}</p>
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-2 lg:items-end mt-2 lg:mt-0">
                    {job.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 text-xs text-muted-foreground rounded-md transition-colors duration-500 w-fit"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="projects"
          ref={(el) => {
            sectionsRef.current[2] = el
          }}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">Featured Projects</h2>
              <div className="text-sm text-muted-foreground font-mono">SELECTED WORK</div>
            </div>

            <div className="space-y-8 sm:space-y-12">
              {data.projects
                .filter((project) => project.enabled !== false)
                .slice(0, visibleProjects)
                .map((project, index) => {
                  const hasValidLink = project.link && project.link !== "#" && project.link !== ""
                  const sharedClassName =
                    "group block p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 hover:shadow-lg transition-all duration-500"
                  const content = (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                          {project.title}
                        </h3>
                        {hasValidLink && (
                          <svg
                            className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300 flex-shrink-0 ml-2 mt-1 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        )}
                      </div>

                      <p className="text-muted-foreground leading-relaxed">{parseMarkdown(project.description)}</p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.tech.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-xs border border-border rounded-full text-muted-foreground group-hover:border-muted-foreground/50 transition-colors duration-500"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )

                  return hasValidLink ? (
                    <Link key={index} href={project.link} className={sharedClassName}>
                      {content}
                    </Link>
                  ) : (
                    <div key={index} className={sharedClassName}>
                      {content}
                    </div>
                  )
                })}
            </div>

            {visibleProjects < data.projects.filter((project) => project.enabled !== false).length && (
              <div className="flex flex-col items-center gap-2 pt-4">
                <button
                  onClick={loadMoreProjects}
                  className="group w-12 h-12 rounded-full border border-border hover:border-muted-foreground/50 transition-all duration-500 flex items-center justify-center hover:shadow-lg cursor-pointer"
                  aria-label="Load more projects"
                >
                  <svg
                    className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-xs text-muted-foreground font-mono">
                  {data.projects.filter((project) => project.enabled !== false).length - visibleProjects} MORE
                </span>
              </div>
            )}
          </div>
        </section>

        {hasThoughts && (
          <section
            id="thoughts"
            ref={(el) => {
              sectionsRef.current[3] = el
            }}
            className="min-h-screen py-20 sm:py-32 opacity-0"
          >
            <div className="space-y-12 sm:space-y-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <h2 className="text-3xl sm:text-4xl font-light">Recent Thoughts</h2>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground font-mono hover:text-foreground transition-colors duration-300 flex items-center gap-2"
                >
                  VIEW ALL
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>

              <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                {recentPosts.map((post, index) => (
                  <Link
                    key={index}
                    href={`/blog/${post.slug}`}
                    className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg"
                  >
                    <article className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                        {post.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        <span>Read more</span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section
          id="connect"
          ref={(el) => {
            sectionsRef.current[hasThoughts ? 4 : 3] = el
          }}
          className="py-20 sm:py-32 opacity-0"
        >
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl font-light">{data.connect.title}</h2>

              <div className="space-y-6">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  {parseMarkdown(data.connect.description)}
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="group flex flex-col items-start p-5 border border-border rounded-lg hover:border-muted-foreground/30 hover:bg-muted/5 transition-all duration-300 text-left cursor-pointer"
                  >
                    <div className="mb-4 text-muted-foreground group-hover:text-foreground transition-colors">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <div className="text-base font-medium">Send me a message</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">Feedback/Questions</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      // @ts-ignore
                      window.Calendly?.initPopupWidget({
                        url: "https://calendly.com/carter-tran/30min?hide_event_type_details=1",
                      })
                    }}
                    className="group flex flex-col items-start p-5 border border-border rounded-lg hover:border-muted-foreground/30 hover:bg-muted/5 transition-all duration-300 text-left cursor-pointer"
                  >
                    <div className="mb-4 text-muted-foreground group-hover:text-foreground transition-colors">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <div className="text-base font-medium">Schedule a meeting</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">Meeting/Consultation</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="text-sm text-muted-foreground font-mono">ELSEWHERE</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.connect.socials.map((social) => (
                  <Link
                    key={social.name}
                    href={social.url}
                    className="group p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                        {social.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{social.handle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 sm:py-16 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} {data.footer.copyright}</div>
              <div className="text-xs text-muted-foreground">{data.footer.builtWith}</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300 cursor-pointer"
                aria-label="Toggle theme"
              >
                {mounted && theme === "dark" ? (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setShowFeedbackForm(true)}
                className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300 cursor-pointer"
                aria-label="Send feedback"
              >
                <svg
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>

      {showFeedbackForm && <FeedbackForm onClose={() => setShowFeedbackForm(false)} />}
    </div>
  )
}
