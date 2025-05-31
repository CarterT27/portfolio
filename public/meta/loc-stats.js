import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';

// Global variables
let xScale;
let yScale;
let data;
let commits;
let files;
let isInitialized = false;

// Animation and filtering variables
let commitProgress = 100;
let timeScale;
let commitMaxTime;
let filteredCommits = [];

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
    
    /* Time slider styles */
    #time-controls {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    #time-controls label {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 500;
    }
    
    #commit-progress {
      flex: 1;
      margin: 0 1rem;
    }
    
    #commit-time {
      margin-left: auto;
      font-family: monospace;
      font-weight: bold;
      color: #475569;
    }
    
    /* Unit visualization styles */
    .loc {
      display: flex;
      width: 0.5em;
      aspect-ratio: 1;
      background: steelblue;
      border-radius: 50%;
    }
    
    #files {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.5em 1em;
      margin-top: 2rem;
    }
    
    #files dt {
      font-weight: bold;
      padding-top: 0.6em;
    }
    
    #files dd {
      grid-column: 2;
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      align-content: start;
      gap: 0.15em;
      padding-top: 0.6em;
      margin-left: 0;
    }
    
    /* Scrollytelling styles */
    #scrolly-1 {
      position: relative;
      display: flex;
      gap: 1rem;
    }
    
    #scrolly-1 > * {
      flex: 1;
    }
    
    #scatter-story {
      position: relative;
    }
    
    #scatter-plot {
      position: sticky;
      top: 0;
      left: 0;
      bottom: auto;
      height: 50vh;
    }
    
    .step {
      margin-bottom: 2rem;
      padding: 2rem;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
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
    const commits = preloadedData.commits.map(commit => ({
      ...commit,
      datetime: new Date(commit.datetime),
      lines: commit.lines
    }));
    return d3.sort(commits, d => d.datetime); // Sort by datetime
  }
  
  // Fall back to processing if no preloaded data
  console.log('Processing commits from data');
  const commits = d3
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
    
  return d3.sort(commits, d => d.datetime); // Sort by datetime
}

function processFiles(data) {
  const colors = d3.scaleOrdinal(d3.schemeTableau10);
  
  return d3
    .groups(data, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    })
    .sort((a, b) => b.lines.length - a.lines.length);
}

function initializeTimeControls() {
  // Set up time scale
  timeScale = d3
    .scaleTime()
    .domain([
      d3.min(commits, (d) => d.datetime),
      d3.max(commits, (d) => d.datetime),
    ])
    .range([0, 100]);
    
  commitMaxTime = timeScale.invert(commitProgress);
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
}

function onTimeSliderChange() {
  const slider = document.getElementById('commit-progress');
  if (!slider) return;
  
  // Update progress
  commitProgress = +slider.value;
  commitMaxTime = timeScale.invert(commitProgress);
  
  // Update time display
  const timeElement = document.getElementById('commit-time');
  if (timeElement) {
    timeElement.textContent = commitMaxTime.toLocaleString('en', {
      dateStyle: 'long',
      timeStyle: 'short'
    });
  }
  
  // Filter commits
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  
  // Update scatter plot
  updateScatterPlot(data, filteredCommits);
}

function createTimeControls() {
  // Create time controls container
  const controlsContainer = d3.select('#chart')
    .insert('div', ':first-child')
    .attr('id', 'time-controls');
    
  const label = controlsContainer
    .append('label')
    .attr('for', 'commit-progress')
    .text('Show commits until: ');
    
  label
    .append('input')
    .attr('type', 'range')
    .attr('id', 'commit-progress')
    .attr('min', 0)
    .attr('max', 100)
    .attr('value', commitProgress)
    .on('input', onTimeSliderChange);
    
  label
    .append('time')
    .attr('id', 'commit-time');
    
  // Initialize time display
  onTimeSliderChange();
}

function updateScatterPlot(data, commits) {
  if (!commits || commits.length === 0) return;
  
  const svg = d3.select('#chart svg');
  if (svg.empty()) return;
  
  // Update data binding with object constancy
  const dots = svg.select('.dots')
    .selectAll('circle')
    .data(commits, d => d.id); // Use commit id for object constancy
    
  // Remove exiting circles with transition
  dots.exit()
    .transition()
    .duration(300)
    .attr('r', 0)
    .style('fill-opacity', 0)
    .remove();
    
  // Add new circles with entry transition
  const enterDots = dots.enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 0)
    .style('fill-opacity', 0);
    
  // Merge and update all circles
  dots.merge(enterDots)
    .transition()
    .duration(300)
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => {
      const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
      const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 25]);
      return rScale(d.totalLines);
    })
    .style('fill-opacity', 0.7);
    
  // Add event handlers to new circles
  enterDots
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
      window.activeCommit = commit;
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      setTimeout(() => {
        if (!window.isOverTooltip) {
          updateTooltipVisibility(false);
        }
      }, 100);
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

function renderUnitVisualization() {
  if (!files || files.length === 0) return;
  
  const colors = d3.scaleOrdinal(d3.schemeTableau10);
  
  const filesContainer = d3.select('#files')
    .selectAll('dt, dd')
    .data(files.flatMap(file => [
      { type: 'dt', file },
      { type: 'dd', file }
    ]))
    .join(enter => {
      const selection = enter.append(d => 
        document.createElement(d.type)
      );
      
      // Handle dt elements (file names)
      selection
        .filter(d => d.type === 'dt')
        .text(d => d.file.name);
        
      // Handle dd elements (dots)
      const ddElements = selection
        .filter(d => d.type === 'dd');
        
      ddElements
        .selectAll('.loc')
        .data(d => d.file.lines)
        .join('div')
        .attr('class', 'loc')
        .attr('style', (d) => `background: ${colors(d.type)}`);
        
      return selection;
    });
}

function setupScrollytelling() {
  // Check if we're in scrollytelling mode
  const scrollyContainer = document.getElementById('scrolly-1');
  if (!scrollyContainer) return;
  
  // Generate story content
  const storyContainer = d3.select('#scatter-story');
  if (storyContainer.empty()) return;
  
  storyContainer
    .selectAll('.step')
    .data(commits)
    .join('div')
    .attr('class', 'step')
    .html((d, i) => `
      On ${d.datetime.toLocaleString('en', {
        dateStyle: 'full',
        timeStyle: 'short',
      })},
      I made <a href="${d.url}" target="_blank">${
        i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
      }</a>.
      I edited ${d.totalLines} lines across ${
        d3.rollups(d.lines, (D) => D.length, (d) => d.file).length
      } files.
      Then I looked over all I had made, and I saw that it was very good.
    `);
    
  // Set up Scrollama
  function onStepEnter(response) {
    const commitData = response.element.__data__;
    if (commitData && commitData.datetime) {
      // Update to show commits up to this point
      const currentTime = commitData.datetime;
      const progressPercent = timeScale(currentTime);
      
      // Update filtered commits
      filteredCommits = commits.filter((d) => d.datetime <= currentTime);
      
      // Update visualization
      updateScatterPlot(data, filteredCommits);
      
      // Update slider if it exists
      const slider = document.getElementById('commit-progress');
      if (slider) {
        slider.value = progressPercent;
        const timeElement = document.getElementById('commit-time');
        if (timeElement) {
          timeElement.textContent = currentTime.toLocaleString('en', {
            dateStyle: 'long',
            timeStyle: 'short'
          });
        }
      }
    }
  }
  
  const scroller = scrollama();
  scroller
    .setup({
      container: '#scrolly-1',
      step: '#scrolly-1 .step',
    })
    .onStepEnter(onStepEnter);
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
  
  // Initialize time controls and filtering
  initializeTimeControls();
  
  // Check if we're not in scrollytelling mode before creating time controls
  const scrollyContainer = document.getElementById('scrolly-1');
  if (!scrollyContainer) {
    createTimeControls();
  }
  
  // Use filtered commits for initial render
  const commitsToRender = filteredCommits.length > 0 ? filteredCommits : sortedCommits;
  
  // Now add the dots after the scales have been updated
  dots
    .selectAll('circle')
    .data(commitsToRender, d => d.id)
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
    files = processFiles(data);
    
    // Clear any loading indicators
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // Render visualization
    renderCommitInfo(data, commits);
    renderScatterPlot(data, commits);
    
    // Render unit visualization if files container exists
    const filesElement = document.getElementById('files');
    if (filesElement) {
      renderUnitVisualization();
    }
    
    // Setup scrollytelling if container exists
    setupScrollytelling();
    
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