import type { MDXComponents } from 'mdx/types'
import { MDXImage, Callout, CodeBlock } from '@/components/blog/MDXComponents'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl sm:text-4xl font-light mt-12 mb-6 text-foreground">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl sm:text-3xl font-light mt-10 mb-4 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl sm:text-2xl font-light mt-8 mb-3 text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg sm:text-xl font-medium mt-6 mb-2 text-foreground">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="text-muted-foreground leading-relaxed mb-6">{children}</p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors duration-300"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-border pl-6 my-6 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-border my-12" />,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6 rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/30">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-muted/10 transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-medium text-foreground whitespace-nowrap">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-muted-foreground">
        {children}
      </td>
    ),
    pre: ({ children, ...props }) => (
      <pre
        className="overflow-x-auto rounded-lg p-4 mb-6 text-sm bg-muted/30 border border-border"
        {...props}
      >
        {children}
      </pre>
    ),
    code: ({ children, className, ...props }) => {
      const isInline = !className
      if (isInline) {
        return (
          <code
            className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        )
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    img: MDXImage,
    Callout,
    CodeBlock,
    ...components,
  }
}
