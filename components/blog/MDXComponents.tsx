'use client'

import { useState } from 'react'

type CalloutType = 'info' | 'warning' | 'success' | 'error'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}

const calloutStyles: Record<CalloutType, { bg: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'ℹ️',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: '⚠️',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: '✕',
  },
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles = calloutStyles[type]

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 my-6`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{styles.icon}</span>
        <div className="flex-1">
          {title && (
            <div className="font-medium text-foreground mb-1">{title}</div>
          )}
          <div className="text-muted-foreground text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}

interface MDXImageProps {
  src?: string
  alt?: string
  caption?: string
}

export function MDXImage({ src, alt, caption }: MDXImageProps) {
  return (
    <figure className="my-8">
      <div className="rounded-lg overflow-hidden border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ''}
          className="w-full h-auto"
        />
      </div>
      {(caption || alt) && (
        <figcaption className="text-center text-sm text-muted-foreground mt-3">
          {caption || alt}
        </figcaption>
      )}
    </figure>
  )
}

interface CodeBlockProps {
  children: React.ReactNode
  filename?: string
}

export function CodeBlock({ children, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const code = typeof children === 'string' ? children : ''
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-6">
      {filename && (
        <div className="absolute top-0 left-0 right-0 px-4 py-2 bg-muted/50 border-b border-border rounded-t-lg">
          <span className="text-xs text-muted-foreground font-mono">
            {filename}
          </span>
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted"
        aria-label="Copy code"
      >
        {copied ? (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
      <div className={filename ? 'pt-10' : ''}>{children}</div>
    </div>
  )
}
