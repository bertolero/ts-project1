// listener type
import { Project, ProjectStatus } from '../model/project.js'

type Listener<T> = (item: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener (listener: Listener<T>) {
      this.listeners.push(listener)
    }
}

// project state management
export class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState

    // eslint-disable-next-line no-useless-constructor
    private constructor () {
      super()
    }

    static getInstance () {
      if (this.instance) {
        return this.instance
      }
      this.instance = new ProjectState()
      return this.instance
    }

    addProject (title: string, description: string, numberOfPeople: number) {
      const newProject = new Project(
        Math.random().toString(),
        title,
        description,
        numberOfPeople,
        ProjectStatus.Active
      )
      this.projects.push(newProject)
      this.updateListeners()
    }

    moveProject (projectId: string, newStatus: ProjectStatus) {
      const project = this.projects.find(project => project.id === projectId)
      if (project && project.status !== newStatus) {
        project.status = newStatus
        this.updateListeners()
      }
    }

    private updateListeners () {
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice())
      }
    }
}

export const projectState = ProjectState.getInstance()
