export interface AvatarLayer {
  image: string;
  zIndex: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  bounce?: boolean; // Whether this layer should have a bouncing animation
}

export interface AvatarState {
  background?: string;
  layers: AvatarLayer[];
}

export interface Experience {
  company: string
  role: string
  date: string
  description: string
  avatar_state: AvatarState
  url?: string // Optional URL for the company
}

export interface Project {
  title: string
  summary: string
  description: string
  tags: string[]
  github: string | null
  live: string | null
  image: string
  imageScale?: number // Optional scaling factor for project images
}

export interface ProjectFilterState {
  searchTerm: string
  selectedYear: string | null
}

export interface GithubStats {
  followers: number
  following: number
  public_repos: number
  public_gists: number
}
