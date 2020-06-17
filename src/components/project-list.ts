import { Project, ProjectStatus } from '../model/project'
import { ProjectItem } from './project-item'
import { DragTarget } from '../model/drag-drop'
import { Component } from './base-component'
import { Autobind } from '../decorators/autobind'
import { projectState } from '../state/project-state'

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: any[];

    constructor (private type: 'active' | 'finished') {
      super('project-list', 'app', false, `${type}-projects`)
      this.assignedProjects = []

      this.configure()
      this.renderContent()
    }

    @Autobind
    dragOverHandler (event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
        // necessary because the default is not allow drop events
        event.preventDefault()
        const listElement = this.element.querySelector('ul')!
        listElement.classList.add('droppable')
      }
    }

    @Autobind
    dropHandler (event: DragEvent): void {
      const projectId = event.dataTransfer!.getData('text/plain')
      projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
    }

    @Autobind
    dragLeaveHandler (event: DragEvent): void {
      const listElement = this.element.querySelector('ul')!
      listElement.classList.remove('droppable')
    }

    configure () {
      this.element.addEventListener('dragover', this.dragOverHandler)
      this.element.addEventListener('dragleave', this.dragLeaveHandler)
      this.element.addEventListener('drop', this.dropHandler)
      projectState.addListener((projects: Project[]) => {
        this.assignedProjects = projects.filter(project => {
          if (this.type === 'active') {
            return project.status === ProjectStatus.Active
          }
          return project.status === ProjectStatus.Finished
        })
        this.renderProjects()
      })
    }

    renderContent () {
      const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }

    private renderProjects () {
      const listElements = document.getElementById(`${this.type}-projects-list`)!
      listElements.innerHTML = ''
      for (const projectItem of this.assignedProjects!) {
        new ProjectItem(this.element.querySelector('ul')!.id, projectItem)
      }
    }
}
