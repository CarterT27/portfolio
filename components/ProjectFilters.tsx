"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import * as d3 from "d3"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter, faSearch, faXmark } from "@fortawesome/free-solid-svg-icons"
import type { Project, ProjectFilterState } from "@/types"

interface ProjectFiltersProps {
  projects: Project[]
  filterState: ProjectFilterState
  onFilterChange: (filterState: ProjectFilterState) => void
}

interface YearCount {
  year: string
  count: number
}

export default function ProjectFilters({ 
  projects, 
  filterState, 
  onFilterChange 
}: ProjectFiltersProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [yearCounts, setYearCounts] = useState<YearCount[]>([])
  
  // Extract years from projects and count them
  useEffect(() => {
    if (!projects.length) return
    
    const yearMap = new Map<string, number>()
    
    projects.forEach(project => {
      const yearTag = project.tags.find(tag => /^\d{4}$/.test(tag))
      if (yearTag) {
        yearMap.set(yearTag, (yearMap.get(yearTag) || 0) + 1)
      }
    })
    
    const counts = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year)) // Sort by year descending
    
    setYearCounts(counts)
  }, [projects])
  
  // Create the pie chart using D3
  useEffect(() => {
    if (!svgRef.current || !yearCounts.length) return
    
    const svg = d3.select(svgRef.current)
    const width = 180
    const height = 180
    const radius = Math.min(width, height) / 2
    
    svg.selectAll("*").remove() // Clear previous chart
    
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)
    
    // Generate a color for each year to ensure uniqueness
    // This uses the oklch color space for perceptual uniformity
    // and distributes hues evenly around the color wheel
    const generateColors = (count: number) => {
      const colors: string[] = [];
      const baseChroma = "0.25"; // Saturation
      const baseLightness = "65%"; // Lightness
      
      // Distribute hues evenly around the color wheel (0-360)
      for (let i = 0; i < count; i++) {
        const hue = Math.floor((i * 360) / count);
        // Alternate lightness slightly for better distinction
        const lightness = i % 2 === 0 ? "65%" : "70%";
        colors.push(`oklch(${lightness} ${baseChroma} ${hue})`);
      }
      
      return colors;
    };
    
    // Create a color scale with unique colors for each year
    const color = d3.scaleOrdinal<string>()
      .domain(yearCounts.map(d => d.year))
      .range(generateColors(yearCounts.length));
    
    // Create the pie layout
    const pieLayout = d3.pie<YearCount>()
      .value(d => d.count)
      .sort(null)
    
    const arcPath = d3.arc<d3.PieArcDatum<YearCount>>()
      .innerRadius(radius * 0.5) // Create a donut chart
      .outerRadius(radius * 0.9)
    
    // Create arcs for the pie chart
    const arcs = g.selectAll(".arc")
      .data(pieLayout(yearCounts))
      .enter()
      .append("g")
      .attr("class", "arc")
      .style("cursor", "pointer")
      .on("click", (event, d: any) => {
        // Toggle the year filter on click
        const year = d.data.year
        const newSelectedYear = filterState.selectedYear === year ? null : year
        onFilterChange({
          ...filterState,
          selectedYear: newSelectedYear
        })
      })
    
    // Add tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs absolute opacity-0 pointer-events-none z-50 transition-opacity")
      .style("opacity", 0)
    
    // Add colored segments with transitions
    arcs.append("path")
      .attr("d", arcPath)
      .attr("fill", (d: any) => color(d.data.year))
      .attr("stroke", "var(--background)")
      .attr("stroke-width", 2)
      .style("opacity", (d: any) => filterState.selectedYear && filterState.selectedYear !== d.data.year ? 0.3 : 1)
      .style("transition", "all 0.3s ease")
      .style("transform-origin", "center")
      .on("mouseover", (event, d: any) => {
        // Highlight on hover
        const path = d3.select(event.currentTarget);
        path.style("transform", "scale(1.05)")
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
            
        tooltip.transition()
          .duration(200)
          .style("opacity", .9)
        tooltip.html(`${d.data.year}: ${d.data.count} project${d.data.count > 1 ? 's' : ''}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on("mouseout", (event) => {
        // Reset on mouseout
        const path = d3.select(event.currentTarget);
        path.style("transform", "scale(1)")
            .style("filter", "none");
            
        tooltip.transition()
          .duration(500)
          .style("opacity", 0)
      })
    
    // Apply a visual effect to the selected year slice
    if (filterState.selectedYear) {
      arcs.selectAll("path")
        .filter((d: any) => d.data.year === filterState.selectedYear)
        .style("filter", "drop-shadow(0 2px 5px rgba(0,0,0,0.3)) brightness(1.1)")
        .style("transform", "scale(1.05)");
    }
    
    // Add year labels
    arcs.append("text")
      .attr("transform", (d: any) => `translate(${arcPath.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("class", "text-[10px] font-semibold fill-background")
      .text((d: any) => d.data.year)
    
    // Add a title in the center of the donut
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0em")
      .attr("class", "fill-muted-foreground text-xs")
      .text("Projects by")
    
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("class", "fill-muted-foreground text-xs")
      .text("Year")
    
    // Clean up on unmount
    return () => {
      tooltip.remove()
    }
  }, [yearCounts, filterState.selectedYear, onFilterChange])
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filterState,
      searchTerm: e.target.value
    })
  }
  
  const clearFilters = () => {
    onFilterChange({
      searchTerm: "",
      selectedYear: null
    })
  }
  
  const hasActiveFilters = filterState.searchTerm || filterState.selectedYear
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      className="w-full mb-6 bg-card rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-center gap-6 border"
    >
      <div className="flex-shrink-0 flex flex-col items-center">
        <svg ref={svgRef} width="180" height="180" className="mx-auto"></svg>
        
        {/* Year color legend */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {yearCounts.map(({ year, count }) => (
            <div 
              key={year} 
              className="flex items-center gap-1.5"
              style={{ 
                opacity: filterState.selectedYear && filterState.selectedYear !== year ? 0.5 : 1,
                cursor: 'pointer'
              }}
              onClick={() => onFilterChange({
                ...filterState,
                selectedYear: filterState.selectedYear === year ? null : year
              })}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  background: `oklch(${parseInt(year) % 2 === 0 ? "65%" : "70%"} 0.25 ${Math.floor((yearCounts.findIndex(y => y.year === year) * 360) / yearCounts.length)})`,
                  boxShadow: filterState.selectedYear === year ? '0 0 3px rgba(0,0,0,0.3)' : 'none'
                }}
              ></div>
              <span>{year}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-grow space-y-4 w-full">
        <h3 className="text-lg font-semibold">Filter Projects</h3>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
            />
            <Input
              type="text"
              placeholder="Search projects..."
              className="pl-10"
              value={filterState.searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <FontAwesomeIcon icon={faXmark} className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {yearCounts.map(({ year, count }) => (
            <Button
              key={year}
              variant={filterState.selectedYear === year ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange({
                ...filterState,
                selectedYear: filterState.selectedYear === year ? null : year
              })}
              className="gap-2"
            >
              <span>{year}</span>
              <span className="bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs">
                {count}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  )
} 