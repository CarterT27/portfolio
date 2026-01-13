
type CalloutType = 'info' | 'warning' | 'success' | 'error'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}

const calloutStyles: Record<CalloutType, { bg: string; border: string }> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles = calloutStyles[type]

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 my-6`}
    >
      <div className="flex items-start">
        <div className="flex-1">
          {title && (
            <div className="font-medium text-foreground mb-1">{title}</div>
          )}
          <div className="text-muted-foreground text-sm [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
            {children}
          </div>
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
  return (
    <div className="relative my-6">
      {filename && (
        <div className="absolute top-0 left-0 right-0 px-4 py-2 bg-muted/50 border-b border-border rounded-t-lg">
          <span className="text-xs text-muted-foreground font-mono">
            {filename}
          </span>
        </div>
      )}
      <div className={filename ? 'pt-10' : ''}>{children}</div>
    </div>
  )
}
