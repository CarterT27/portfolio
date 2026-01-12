import Link from 'next/link'
import { getPostMetadata } from '@/lib/mdx'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Blog | Carter Tran',
  description: 'Research notes, experiments, and thoughts on machine learning and technology.',
}

export default function BlogPage() {
  const posts = getPostMetadata()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-32">
        <div className="space-y-12 sm:space-y-16">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to home
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-light">Blog</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Research notes, experiments, and thoughts on machine learning,
                scientific computing, and technology.
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No posts yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 hover:shadow-lg transition-all duration-500"
                >
                  <article className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs border border-border rounded-full text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

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
          )}
        </div>

        <div className="mt-24">
          <Footer />
        </div>
      </main>
    </div>
  )
}
