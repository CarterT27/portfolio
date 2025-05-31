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
      <style dangerouslySetInnerHTML={{
        __html: `
          #scatter-plot {
            position: sticky !important;
            top: 100px !important;
          }
          
          /* Scrollytelling structural styles */
          #scrollytelling {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          #scroll-container {
            grid-column: 1;
            position: relative;
            width: 95%;
            height: 350px;
            overflow-y: scroll;
            border: 1px solid #ccc;
            margin-bottom: 50px;
          }

          #chart {
            grid-column: 2;
          }

          #spacer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: none;
            pointer-events: none;
          }

          #items-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }

          .item {
            height: 100px;
            padding: 10px;
            box-sizing: border-box;
            border-bottom: 2px solid #eee;
            position: absolute;
            width: 100%;
          }

          #scrollytelling-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 2rem;
            border: 1px solid #ccc;
            padding: 1rem;
          }

          #scroll-container-2 {
            height: 80vh;
            overflow-y: scroll;
            position: relative;
            border: 1px solid #ccc;
          }

          #spacer-2 {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: none;
          }

          #items-container-2 {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            pointer-events: none;
          }

          .item-longest {
            position: absolute;
            width: 90%;
            margin: 0 auto;
            background: #f5f5f5;
            border: 2px solid #eee;
            box-sizing: border-box;
            padding: 0.5em;
            border-radius: 4px;
          }

          #files-longest {
            border: 1px solid #ccc;
            padding: 0.5rem;
            overflow-y: auto;
            max-height: 80vh;
          }

          .files {
            display: grid;
            gap: 0.5em;
            margin-top: 1em;
          }

          /* Unit visualization line styling */
          .line {
            display: flex;
            width: 0.5em;
            aspect-ratio: 1;
            background: steelblue;
            border-radius: 50%;
          }

          dd {
            display: flex;
            flex-wrap: wrap;
            align-items: start;
            gap: 0.15em;
            padding-top: 0.6em;
            margin-left: 0;
          }

          /* Tooltip styling */
          dl.info {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 0.5em 1em;
            align-items: start;
            transition-duration: 500ms;
            transition-property: opacity, visibility;
          }

          dl.info[hidden]:not(:hover, :focus-within) {
            opacity: 0;
            visibility: hidden;
          }

          dl.info dt {
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
          }

          dl.info dd {
            margin: 0;
            font-weight: normal;
          }

          /* Stats grid styling */
          #stats dl {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            text-align: left;
            gap: 0.5em 1em;
            width: 100%;
          }

          #stats dt {
            font-size: 0.9em;
            color: #666;
            font-weight: bold;
            text-transform: uppercase;
            grid-row: 1;
            text-align: left;
          }

          #stats dd {
            font-size: 2em;
            margin: 0;
            grid-row: 2;
            text-align: left;
          }
        `
      }} />
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
            
            {/* First scrollytelling section for commits */}
            <div id="scrollytelling" className="mb-8">
              <div id="scroll-container">
                <div id="spacer"></div>
                <div id="items-container"></div>
              </div>
              <div id="chart"></div>
            </div>
            
            {/* Selection count and language breakdown */}
            <p id="selection-count" className="mb-2">No commits selected</p>
            <dl id="language-breakdown" className="stats mb-8"></dl>
            
            {/* Enhanced commit tooltip */}
            <dl id="commit-tooltip" className="info tooltip" hidden>
              <dt>Commit</dt>
              <dd>
                <a href="" id="commit-link" target="_blank"></a>
              </dd>
            
              <dt>Date</dt>
              <dd id="commit-date"></dd>
            
              <dt>Time</dt>
              <dd id="commit-time"></dd>

              <dt>Author</dt>
              <dd id="commit-author"></dd>

              <dt>Lines Edited</dt>
              <dd id="commit-lines"></dd>
            </dl>
            
            {/* Files section header */}
            <h2 className="text-2xl font-semibold mb-4">Files by size</h2>
            
            {/* Files visualization */}
            <dl id="files" className="mb-8"></dl>
            
            {/* Second scrollytelling section for longest lines */}
            <h2 className="text-2xl font-semibold mb-4">Commits by longest line</h2>
            <div id="scrollytelling-2" className="mb-8">
              {/* Left: scrollable narrative items (sorted by longestLine) */}
              <div id="scroll-container-2">
                <div id="spacer-2"></div>
                <div id="items-container-2"></div>
              </div>
              {/* Right: Unit visualization for longestLine */}
              <div id="files-longest" className="files"></div>
            </div>
            
          </VisualizationWrapper>
        </div>
      </div>
      <Footer />
    </main>
  )
} 