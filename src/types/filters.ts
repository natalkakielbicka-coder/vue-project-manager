import type { ProjectStatus } from './project'

export type FilterStatus = ProjectStatus | 'Wszystkie'

export type SortOption = 'newest' | 'oldest' | 'name' | 'priority' | 'custom'
