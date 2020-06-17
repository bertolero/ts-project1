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
type Listener<T> = (item: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener (listener: Listener<T>) {
      this.listeners.push(listener)
    }
}

// project state management
class ProjectState extends State<Project> {
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

// base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    protected constructor (templateId: string, hostElementId: string,
      insertAtStart: boolean, newElementId?: string) {
      this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement
      this.hostElement = document.getElementById(hostElementId)! as T

      const importedNode = document.importNode(this.templateElement.content, true)
      this.element = importedNode.firstElementChild as U
      if (newElementId) {
        this.element.id = newElementId
      }

      this.attach(insertAtStart)
    }

    private attach (insertAtBeginning:boolean) {
      this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element)
    }

    abstract configure():void
    abstract renderContent():void
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: any[];

    constructor (private type: 'active' | 'finished') {
      super('project-list', 'app', false, `${type}-projects`)
      this.assignedProjects = []

      this.configure()
      this.renderContent()
    }

    configure () {
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
        const listItem = document.createElement('li')
        listItem.textContent = projectItem.title
        listElements.appendChild(listItem)
      }
    }
}

// project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor () {
      super('project-input', 'app', true, 'user-input')

      this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
      this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
      this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

      this.configure()
    }

    configure () {
      this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent () {
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
}

const projectInput = new ProjectInput()
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')
