import { Draggable } from '../model/drag-drop'
import { Component } from './base-component'
import { Project } from '../model/project'
import { Autobind } from '../decorators/autobind'

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project

    constructor (hostId: string, project: Project) {
      super('single-project', hostId, false, project.id)

      this.project = project

      this.configure()
      this.renderContent()
    }

    configure () {
      this.element.addEventListener('dragstart', this.dragStartHandler)
      this.element.addEventListener('dragend', this.dragEndHandler)
    }

    get persons () {
      if (this.project.people === 1) {
        return '1 person'
      }
      return `${this.project.people} persons`
    }

    renderContent () {
        this.element.querySelector('h2')!.textContent = this.project.title
        this.element.querySelector('h3')!.textContent = `${this.persons} assigned`
        this.element.querySelector('p')!.textContent = this.project.description
    }

    dragEndHandler (event: DragEvent): void {
      console.log('DragEnd')
    }

    @Autobind
    dragStartHandler (event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id)
        event.dataTransfer!.effectAllowed = 'move'
    }
}
