import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons"
import { faChartLine } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t pt-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/CarterT27"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faGithub} className="h-6 w-6" />
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://linkedin.com/in/cartertran"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faLinkedin} className="h-6 w-6" />
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href="/meta"
              aria-label="Website Meta"
              className="hover:text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faChartLine} className="h-6 w-6" />
            </a>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          © {new Date().getFullYear()} Carter Tran. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
