import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Global variables
let xScale;
let yScale;
let data;
let commits;
let isInitialized = false;

console.log('D3 Visualization script loaded');

// Check if data is preloaded
function getPreloadedData() {
  const dataElement = document.getElementById('commit-data');
  if (dataElement) {
    try {
      const parsed = JSON.parse(dataElement.textContent);
      console.log('Preloaded data found:', { dataLength: parsed.data?.length || 0 });
      return parsed;
    } catch (error) {
      console.error('Error parsing preloaded commit data:', error);
      return null;
    }
  }
  console.log('No preloaded data found, will load from CSV');
  return null;
}

// Add CSS styling for visualization
function addStylesheet() {
  // Check if the style has already been added
  if (document.getElementById('loc-stats-style')) return;

  console.log('Adding visualization styles');
  const style = document.createElement('style');
  style.id = 'loc-stats-style';
  style.textContent = `
    .stats dt {
      font-weight: bold;
      margin-bottom: 0.3em;
    }
    .stats dd {
      margin-bottom: 1em;
      font-size: 1.2em;
    }
    #chart svg circle {
      fill: #3b82f6;
      stroke: #1e40af;
      stroke-width: 1px;
      transition: fill-opacity 0.2s;
      cursor: pointer;
    }
    #chart svg circle:hover {
      stroke-width: 2px;
    }
    .selected {
      stroke: #f59e0b !important;
      stroke-width: 2px !important;
    }
    .gridlines line {
      stroke: #e5e7eb;
      stroke-opacity: 0.2;
    }
    .brush-container .selection {
      stroke: #f59e0b;
      fill: #f59e0b;
      fill-opacity: 0.1;
    }
    #commit-tooltip {
      background-color: #1e293b;
      color: #f8fafc;
      border-radius: 6px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 12px;
      font-size: 0.9em;
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-width: 300px;
      opacity: 0;
      transition: opacity 0.15s;
      cursor: default;
    }
    #commit-tooltip.visible {
      opacity: 1;
    }
    #commit-tooltip a {
      color: #60a5fa;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 100%;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid rgba(96, 165, 250, 0.3);
      margin-bottom: 12px;
      background-color: rgba(96, 165, 250, 0.1);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    #commit-tooltip a:hover {
      color: #93c5fd;
      background-color: rgba(96, 165, 250, 0.2);
      border-color: rgba(96, 165, 250, 0.5);
      transform: translateY(-1px);
    }
    .commit-hash {
      font-family: monospace;
      font-size: 1.1em;
      font-weight: bold;
    }
    .view-text {
      font-family: sans-serif;
      font-size: 0.8em;
      font-weight: normal;
      opacity: 0.8;
      margin-left: 8px;
    }
    .commit-info {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 8px;
    }
    .commit-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 0.9em;
    }
    .commit-row span:first-child {
      font-weight: bold;
      color: #a5b4fc;
    }
    .commit-action {
      margin-top: 8px;
      font-size: 0.8em;
      text-align: center;
      color: #93c5fd;
      font-style: italic;
    }
    #selection-count {
      font-weight: bold;
      margin-top: 1em;
    }
    #language-breakdown {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.5em 1em;
    }
    #language-breakdown dt {
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
}

async function loadData() {
  // First check if we have preloaded data
  const preloadedData = getPreloadedData();
  if (preloadedData && preloadedData.data) {
    console.log('Using preloaded data');
    return preloadedData.data.map(d => ({
      ...d,
      date: new Date(d.date),
      datetime: new Date(d.datetime),
    }));
  }
  
  // Fall back to CSV loading if no preloaded data
  console.log('Loading data from CSV');
  const loadedData = await d3.csv('/meta/loc.csv', (row) => ({
      ...row,
      line: Number(row.line), 
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
  }));

  return loadedData;
}

function processCommits(data) {
  // First check if we have preloaded commit data
  const preloadedData = getPreloadedData();
  if (preloadedData && preloadedData.commits) {
    console.log('Using preloaded commit data');
    // Convert datetime strings back to Date objects
    return preloadedData.commits.map(commit => ({
      ...commit,
      datetime: new Date(commit.datetime),
      lines: commit.lines
    }));
  }
  
  // Fall back to processing if no preloaded data
  console.log('Processing commits from data');
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
          id: commit,
          url: 'https://github.com/cartert27/portfolio/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
          value: lines,       // Set the value of 'lines'
          enumerable: false,  // Hide it from `console.log(obj)`
          writable: false,    // Prevent accidental modification
          configurable: false // Prevent deletion or reconfiguration
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  console.log('Rendering commit info');
  // Clear previous content
  d3.select('#stats').html('');
  
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats grid grid-cols-2 gap-2 mb-8 font-mono');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add number of files in the codebase
  dl.append('dt').text('Number of files');
  let uniqueFiles = new Set(data.map(d => d.file)).size;
  dl.append('dd').text(uniqueFiles);

  // Add average file length (in lines)
  dl.append('dt').text('Average File Length (lines)');
  let averageFileLength = d3.mean(
      d3.groups(data, d => d.file)
      .map(([file, lines]) => lines.length)
  );
  dl.append('dd').text(averageFileLength.toFixed(2));

  // Add file with the max file length
  dl.append('dt').text('Longest File (lines)');
  let maxFileLength = d3.max(
      d3.groups(data, d => d.file)
      .map(([file, lines]) => lines.length)
  );
  let maxFile = d3.groups(data, d => d.file)
                  .find(([file, lines]) => lines.length == maxFileLength)[0];
  dl.append('dd').text(maxFile + ' (' + maxFileLength + ')');
}

function renderScatterPlot(data, commits) {
  console.log('Rendering scatter plot');
  // Clear previous chart if it exists
  d3.select('#chart').selectAll('*').remove();
  
  // setup
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3
      .scaleSqrt()
      .domain([minLines, maxLines])
      .range([2, 25]);
  const width = Math.min(1000, window.innerWidth - 40);
  const height = Math.min(600, window.innerHeight * 0.6);
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  // make chart
  const svg = d3
      .select('#chart')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');
  xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([0, width])
      .nice();
  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  
  // Add chart title
  svg.append('text')
     .attr('x', width / 2)
     .attr('y', 20)
     .attr('text-anchor', 'middle')
     .attr('font-size', '18px')
     .attr('font-weight', 'bold')
     .text('Commit Graph');
  
  // Set up dots group but don't add circles yet
  const dots = svg.append('g').attr('class', 'dots');

  // margins
  const margin = { top: 30, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // update scales
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);
  
  // Now add the dots after the scales have been updated
  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
      
      // Store the active commit for the tooltip
      window.activeCommit = commit;
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      
      // Use a timeout to allow moving to the tooltip
      setTimeout(() => {
        if (!window.isOverTooltip) {
          updateTooltipVisibility(false);
        }
      }, 100);
    });
  
  // axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  createBrushSelector(svg);
}

function renderTooltipContent(commit) {
  const tooltip = document.getElementById('commit-tooltip');
  if (!tooltip) return;

  const commitId = commit.id;
  const shortId = commitId.substring(0, 7); // Show short commit hash
  
  tooltip.innerHTML = `
    <div class="commit-header">
      <a id="commit-link" href="${commit.url}" target="_blank" rel="noopener noreferrer" title="View commit ${commitId} on GitHub">
        <span class="commit-hash">${shortId}</span> <span class="view-text">View on GitHub →</span>
      </a>
    </div>
    <div class="commit-info">
      <div class="commit-row"><span>Date:</span> <span>${commit.datetime?.toLocaleString('en', { dateStyle: 'medium' })}</span></div>
      <div class="commit-row"><span>Time:</span> <span>${commit.time}</span></div>
      <div class="commit-row"><span>Lines:</span> <span>${commit.totalLines}</span></div>
      <div class="commit-row"><span>Author:</span> <span>${commit.author}</span></div>
    </div>
  `;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  if (!tooltip) return;
  
  if (isVisible) {
    tooltip.classList.add('visible');
    tooltip.hidden = false;
  } else {
    tooltip.classList.remove('visible');
    setTimeout(() => {
      // Only hide if still not visible class (prevents flicker)
      if (tooltip && !tooltip.classList.contains('visible')) {
        tooltip.hidden = true;
      }
    }, 150);
  }
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  if (!tooltip) return;
  
  // Calculate position to avoid going off screen
  const tooltipWidth = 300; // Max width defined in CSS
  const tooltipHeight = 180; // Approximate height
  const padding = 20; // Padding from edges
  
  // Start with default position (to the right of cursor)
  let left = event.clientX + 15;
  let top = event.clientY + 10;
  
  // Make sure tooltip doesn't go off right edge
  if (left + tooltipWidth + padding > window.innerWidth) {
    left = event.clientX - tooltipWidth - 15; // Position to the left of cursor
  }
  
  // Make sure tooltip doesn't go off bottom edge
  if (top + tooltipHeight + padding > window.innerHeight) {
    top = event.clientY - tooltipHeight - 10; // Position above cursor
  }
  
  // Make sure tooltip doesn't go off top edge
  if (top < padding) {
    top = padding;
  }
  
  // Apply position
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function createBrushSelector(svg) {
  const brushGroup = svg.append('g')
    .attr('class', 'brush-container');
  
  // Create brush
  brushGroup.call(d3.brush().on('start brush end', brushed));
  
  // Make sure dots are above the brush overlay
  svg.selectAll('.dots').raise();
}

function brushed(event) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d),
  );
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
  if (!selection) {
    return false;
  }
  
  // Extract the x and y bounds from the selection
  const [[x0, y0], [x1, y1]] = selection;
  
  // Map commit data to screen coordinates using the scales
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  
  // Check if the point is within the selection rectangle
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  if (!countElement) return;
  
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById('language-breakdown');
  if (!container) return;

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }
}

// Setup tooltip functions
function setupTooltip() {
  const tooltip = document.getElementById('commit-tooltip');
  if (!tooltip) return;
  
  tooltip.style.position = 'fixed';
  tooltip.style.pointerEvents = 'auto'; // Allow interaction with tooltip
  tooltip.style.zIndex = '1000';
  
  // Add tooltip hover events
  window.isOverTooltip = false;
  tooltip.addEventListener('mouseenter', () => {
    window.isOverTooltip = true;
  });
  tooltip.addEventListener('mouseleave', () => {
    window.isOverTooltip = false;
    updateTooltipVisibility(false);
  });
}

// Make initialization function accessible globally
async function initVisualization() {
  // Prevent duplicate initialization
  if (isInitialized) {
    console.log('Visualization already initialized, skipping');
    return;
  }
  
  console.log('Starting visualization initialization');
  
  try {
    const statsElement = document.getElementById('stats');
    const chartElement = document.getElementById('chart');
    
    // Check if elements exist
    if (!statsElement || !chartElement) {
      console.error('Required DOM elements not found');
      return;
    }
    
    // Add CSS styling first
    addStylesheet();
    
    // Setup tooltip
    setupTooltip();
    
    // Load data
    data = await loadData();
    commits = processCommits(data);
    
    // Clear any loading indicators
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // Render visualization
    renderCommitInfo(data, commits);
    renderScatterPlot(data, commits);
    
    // Mark as initialized
    isInitialized = true;
    
    // Add window resize handler for responsiveness
    window.addEventListener('resize', () => {
      renderScatterPlot(data, commits);
    });
    
    console.log('Visualization initialized successfully');
  } catch (error) {
    console.error('Error initializing visualization:', error);
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.innerHTML = `
        <div class="text-red-500">
          <p>Error loading visualization data.</p>
          <p class="text-sm mt-2">${error.message}</p>
        </div>
      `;
    }
  }
}

// Export function to global scope for client component access
window.initVisualization = initVisualization;

// Initialize on page load (both direct and client-side navigation)
if (document.readyState === 'loading') {
  // Still loading, add event listener
  document.addEventListener('DOMContentLoaded', initVisualization);
} else {
  // DOM already loaded, run now
  initVisualization();
} 