import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import { getPostBySlug, getPostSlugs, getAllPosts } from '@/lib/mdx'
import { useMDXComponents } from '@/mdx-components'
import Footer from '@/components/Footer'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.title} | Carter Tran`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllPosts()
  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  const components = useMDXComponents({})

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-32">
        <article className="space-y-12">
          <header className="space-y-6">
            <Link
              href="/blog"
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
              Back to blog
            </Link>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                <span>{post.date}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{post.readTime}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
                {post.title}
              </h1>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
            </div>
          </header>

          <div className="border-t border-border" />

          <div className="prose-custom">
            <MDXRemote
              source={post.content}
              components={components}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMath],
                  rehypePlugins: [
                    [rehypePrettyCode, {
                      theme: { dark: 'github-dark', light: 'github-light' },
                      defaultLang: 'plaintext',
                    }],
                    rehypeKatex,
                  ],
                },
              }}
            />
          </div>

          <div className="border-t border-border pt-12">
            <div className="grid sm:grid-cols-2 gap-6">
              {prevPost && (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                      Previous
                    </div>
                    <div className="font-medium group-hover:text-muted-foreground transition-colors duration-300">
                      {prevPost.title}
                    </div>
                  </div>
                </Link>
              )}
              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className={`group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 ${
                    !prevPost ? 'sm:col-start-2' : ''
                  }`}
                >
                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                      Next
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                    <div className="font-medium group-hover:text-muted-foreground transition-colors duration-300">
                      {nextPost.title}
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </article>

        <div className="mt-24">
          <Footer />
        </div>
      </main>
    </div>
  )
}
