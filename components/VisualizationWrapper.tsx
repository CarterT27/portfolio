'use client'

import { useEffect, ReactNode, useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

interface VisualizationWrapperProps {
  children: ReactNode;
  preloadedData: string | null;
}

export default function VisualizationWrapper({ children, preloadedData }: VisualizationWrapperProps) {
  const router = useRouter();
  const [scriptStatus, setScriptStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  // Track component mount state
  useEffect(() => {
    let isMounted = true;
    
    // Function to check and initialize visualization
    function checkAndInitialize() {
      if (!isMounted) return;
      
      if (typeof window !== 'undefined' && window.initVisualization) {
        console.log('Calling visualization initialization');
        window.initVisualization().catch(err => {
          console.error('Error during visualization initialization:', err);
        });
      } else {
        console.log('Waiting for visualization script to be ready...');
        setTimeout(checkAndInitialize, 100);
      }
    }

    // Start checking after a short delay to ensure DOM is ready
    if (scriptStatus === 'loaded') {
      console.log('Script loaded, starting initialization');
      setTimeout(checkAndInitialize, 50);
    }
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [scriptStatus]);
  
  // Handle script events
  const handleScriptLoad = () => {
    console.log('Script loaded event triggered');
    setScriptStatus('loaded');
  };
  
  const handleScriptError = (error: Error) => {
    console.error('Script failed to load:', error);
    setScriptStatus('error');
  };

  // Ensure the visualization data is visible in client-side navigation
  useEffect(() => {
    // Check for chart element - if found but empty, try to initialize
    const chartElement = document.getElementById('chart');
    if (chartElement && chartElement.innerHTML === '' && scriptStatus === 'loaded') {
      console.log('Chart element found but empty, reinitializing');
      if (window.initVisualization) {
        window.initVisualization().catch(err => {
          console.error('Error during reinitialization:', err);
        });
      }
    }
  }, [scriptStatus]);

  return (
    <>
      {/* Render children (visualization containers) */}
      {children}
      
      {/* Inject preloaded data */}
      {preloadedData && (
        <script
          id="commit-data"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: preloadedData }}
        />
      )}
      
      {/* D3 script with proper loading strategy */}
      <Script 
        id="visualization-script"
        type="module" 
        src="/meta/loc-stats.js" 
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      
      {/* Add a small debug output */}
      <div className="text-xs text-gray-400 mt-2" style={{ display: 'none' }}>
        Script status: {scriptStatus}
      </div>
    </>
  );
} 