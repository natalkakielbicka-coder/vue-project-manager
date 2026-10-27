export type ProjectStatus = 'Do zrobienia' | 'W trakcie' | 'Gotowe'

export type ProjectPriority = 'Niski' | 'Średni' | 'Wysoki' | 'Pilny'

export interface Task {
  id: number | string
  name: string
  completed: boolean
}

export interface Project {
  id: number
  name: string
  status: ProjectStatus
  description: string
  deadline: string
  priority: ProjectPriority
  tasks: Task[]
  createdAt: string
  updatedAt: string | null
}

export type ProjectFormData = Pick<
  Project,
  'name' | 'status' | 'description' | 'deadline' | 'priority' | 'tasks'
>
