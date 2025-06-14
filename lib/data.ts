import type { Experience, Project } from "@/types"

/**
 * Reads and returns the list of experiences from the local JSON file.
 * Throws an error if the file cannot be loaded or parsed.
 */
export async function getExperiences(): Promise<Experience[]> {
  try {
    const data = await import("./experiences.json");
    return data.default as Experience[];
  } catch (error) {
    console.error("Failed to load experiences.json", { error });
    throw new Error("Could not load experiences data");
  }
}

/**
 * Reads and returns the list of projects from the local JSON file.
 * In development mode, all projects are returned including placeholders.
 * In production mode, projects with "Placeholder" titles are filtered out.
 * Projects are sorted by year (newest to oldest) with original order as tiebreaker.
 * Throws an error if the file cannot be loaded or parsed.
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const data = await import("./projects.json");
    const projects = data.default as Project[];
    
    // In development mode, return all projects
    // In production mode, filter out placeholder projects
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let filteredProjects = isDevelopment ? projects : projects.filter(project => project.title !== "Placeholder");
    
    // Sort projects by year (newest to oldest) and use original order as tiebreaker
    return filteredProjects.sort((a, b) => {
      // Extract years from tags
      const yearA = a.tags.find(tag => /^\d{4}$/.test(tag));
      const yearB = b.tags.find(tag => /^\d{4}$/.test(tag));
      
      // If both have years, compare them
      if (yearA && yearB) {
        const yearComparison = yearB.localeCompare(yearA); // Reverse order for newest first
        if (yearComparison !== 0) return yearComparison;
      }
      
      // If years are equal or missing, use original order as tiebreaker
      return projects.indexOf(a) - projects.indexOf(b);
    });
  } catch (error) {
    console.error("Failed to load projects.json", { error });
    throw new Error("Could not load projects data");
  }
}
