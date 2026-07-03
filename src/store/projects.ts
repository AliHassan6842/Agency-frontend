import { create } from 'zustand'

export interface Project {
  id: string
  workspace_id: string
  name: string
  description: string
  status: string
  client_id?: string
  client?: {
    name: string
    company: string
  }
  created_at: string
}

interface ProjectStore {
  projects: Project[]
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => {
    if (state.projects.some(p => p.id === project.id)) {
      return state;
    }
    return { projects: [project, ...state.projects] };
  }),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  }))
}))
