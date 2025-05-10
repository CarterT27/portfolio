import MetaNavbar from "@/components/MetaNavbar"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Meta | Carter Tran",
  description: "This page includes stats about the code of the website."
}

export default function MetaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MetaNavbar />
      <div className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Meta</h1>
          <p className="text-xl text-muted-foreground mb-8">
            This page includes stats about the code of the website.
          </p>
          
          {/* Loading indicator */}
          <div id="loading" className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4">Loading commit data...</p>
          </div>
          
          {/* D3 stats and chart containers */}
          <div id="stats" className="mb-8" style={{ display: 'none' }}></div>
          <div id="chart" className="mb-8" style={{ display: 'none' }}></div>
          <div id="selection-count" className="mb-2" style={{ display: 'none' }}></div>
          <dl id="language-breakdown" className="mb-8" style={{ display: 'none' }}></dl>
          
          {/* Tooltip for commit info */}
          <div id="commit-tooltip" hidden></div>
        </div>
      </div>
      <Footer />
      {/* D3 script will be loaded here */}
      <script type="module" src="/meta/loc-stats.js"></script>
    </main>
  )
} 