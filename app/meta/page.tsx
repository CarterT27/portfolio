import MetaNavbar from "@/components/MetaNavbar"
import Footer from "@/components/Footer"
import { getCommitData } from "@/lib/commit-data"
import Script from 'next/script'
import VisualizationWrapper from "@/components/VisualizationWrapper"

// TypeScript declaration for global window property
declare global {
  interface Window {
    initVisualization?: () => Promise<void>;
  }
}

export const metadata = {
  title: "Meta | Carter Tran",
  description: "This page includes stats about the code of the website."
}

export default async function MetaPage() {
  // Get commit data during server-side rendering
  const commitData = await getCommitData();
  
  // Create a serializable version of the commit data
  const serializedData = commitData ? JSON.stringify(commitData) : null;
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MetaNavbar />
      <div className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Meta</h1>
          <p className="text-xl text-muted-foreground mb-8">
            This page includes visualizations about the code of this website.
          </p>
          
          {/* We'll wrap everything in a client component */}
          <VisualizationWrapper preloadedData={serializedData}>
            {/* Loading indicator - only shown if data failed to preload */}
            {!serializedData && (
              <div id="loading" className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4">Loading commit data...</p>
              </div>
            )}
            
            {/* Stats section */}
            <div id="stats" className="mb-8"></div>
            
            {/* Commits by time of day section */}
            <h2 className="text-2xl font-semibold mb-4">Commits by time of day</h2>
            
            {/* Scrollytelling section for commits */}
            <div id="scrolly-1" className="mb-8">
              <div id="scatter-story"></div>
              <div id="scatter-plot">
                <div id="chart"></div>
                
                {/* Commit tooltip */}
                <div id="commit-tooltip" className="info tooltip" hidden>
                  {/* Tooltip content will be populated by JavaScript */}
                </div>
                
                {/* Selection count and language breakdown */}
                <p id="selection-count" className="mb-2">No commits selected</p>
                <dl id="language-breakdown" className="stats mb-8"></dl>
              </div>
            </div>
            
            {/* Files section header */}
            <h2 className="text-2xl font-semibold mb-4">Files by size</h2>
            
            {/* Unit visualization for files */}
            <dl id="files" className="mb-8"></dl>
            
          </VisualizationWrapper>
        </div>
      </div>
      <Footer />
    </main>
  )
} 