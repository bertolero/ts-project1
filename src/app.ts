// autobind decorator
function Autobind (target: any,
  methodName: string,
  descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get () {
      const boundFn = originalMethod.bind(this)
      return boundFn
    }
  }
  return adjDescriptor
}

// project status enum
enum ProjectStatus {
    Active,
    Finished
}

// project class
class Project {
  constructor (public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) {
  }
}

// listener type
type Listener = (item: Project[]) => void;

// project state management
class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState

    // eslint-disable-next-line no-useless-constructor
    private constructor () {
    }

    static getInstance () {
      if (this.instance) {
        return this.instance
      }
      this.instance = new ProjectState()
      return this.instance
    }

    addListener (listener: Listener) {
      this.listeners.push(listener)
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
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice())
      }
    }
}

const projectState = ProjectState.getInstance()

// validation
interface Validatable {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
}

function validate (validatableInput: Validatable) {
  let isValid = true
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0
  }
  if (validatableInput.minLength !== undefined && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length > validatableInput.minLength
  }
  if (validatableInput.maxLength !== undefined && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length < validatableInput.maxLength
  }
  if (validatableInput.min !== undefined && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value > validatableInput.min
  }
  if (validatableInput.max !== undefined && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value < validatableInput.max
  }
  return isValid
}

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: any[];

    constructor (private type: 'active' | 'finished') {
      this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement
      this.hostElement = document.getElementById('app')! as HTMLDivElement
      this.assignedProjects = []

      const importedNode = document.importNode(this.templateElement.content, true)
      this.element = importedNode.firstElementChild as HTMLElement
      this.element.id = `${type}-projects`

      projectState.addListener((projects: Project[]) => {
        this.assignedProjects = projects
        this.renderProjects()
      })
      this.attach()
      this.renderContent()
    }

    private renderProjects () {
      const listElements = document.getElementById(`${this.type}-projects-list`)!
      for (const projectItem of this.assignedProjects!) {
        const listItem = document.createElement('li')
        listItem.textContent = projectItem.title
        listElements.appendChild(listItem)
      }
    }

    private renderContent () {
      const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }

    private attach () {
      this.hostElement.insertAdjacentElement('beforeend', this.element)
    }
}

// project input class
class ProjectInput {
    templateElement: HTMLTemplateElement;

    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;

    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor () {
      this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement
      this.hostElement = document.getElementById('app')! as HTMLDivElement

      const importedNode = document.importNode(this.templateElement.content, true)
      this.element = importedNode.firstElementChild as HTMLFormElement
      this.element.id = 'user-input'

      this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
      this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
      this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

      this.configure()
      this.attach()
    }

    private gatherUserInput (): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value
      const enteredDescription = this.descriptionInputElement.value
      const enteredPeople = this.peopleInputElement.value

      const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true
      }

      const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5
      }

      const peopleValidatable: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5
      }

      if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
        alert('Invalid input, please try again!')
        return
      }
      return [enteredTitle, enteredDescription, +enteredPeople]
    }

    private clearInputs () {
      this.titleInputElement.value = ''
      this.descriptionInputElement.value = ''
      this.peopleInputElement.value = ''
    }

    @Autobind
    private submitHandler (event: Event) {
      event.preventDefault()
      const userInput = this.gatherUserInput()
      if (Array.isArray(userInput)) {
        const [title, description, people] = userInput
        projectState.addProject(title, description, people)
        this.clearInputs()
      }
    }

    private configure () {
      this.element.addEventListener('submit', this.submitHandler)
    }

    private attach () {
      this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const projectInput = new ProjectInput()
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')
