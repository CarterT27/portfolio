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
 * Throws an error if the file cannot be loaded or parsed.
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const data = await import("./projects.json");
    return data.default as Project[];
  } catch (error) {
    console.error("Failed to load projects.json", { error });
    throw new Error("Could not load projects data");
  }
}
