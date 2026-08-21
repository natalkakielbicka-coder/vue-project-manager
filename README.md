# Project Manager

A responsive project management application built with **Vue 3** and **Vite**.

The app allows users to manage projects on a Kanban-style board, organize tasks, track deadlines and priorities, and persist data locally in the browser.

## Features

### Project management

- Create projects
- Edit existing projects
- Duplicate projects
- Delete projects with confirmation
- Assign project status:
  - Do zrobienia
  - W trakcie
  - Gotowe
- Set project priority:
  - Niski
  - Średni
  - Wysoki
  - Pilny
- Set project deadlines
- Display deadline warnings

### Tasks

- Add tasks to projects
- Mark tasks as completed
- Edit task names
- Delete tasks
- Automatically prompt to move a project to **Gotowe** when all tasks are completed

### Kanban board

- Three project columns
- Drag & drop between statuses
- Drag & drop to reorder projects
- Custom project ordering
- Mobile-friendly status selector

### Filtering and sorting

- Search projects by name
- Filter by project status
- Display project counts for each status
- Sort by:
  - newest
  - oldest
  - name
  - priority
  - custom order
- Reset active filters

### Data and interface

- LocalStorage persistence
- Export projects to JSON
- Import projects from JSON
- Dark mode with saved preference
- Toast notifications
- Confirmation modals
- Responsive layout

## Tech Stack

- Vue 3
- Composition API
- JavaScript
- Vite
- CSS
- LocalStorage
- HTML5 Drag & Drop API
- FileReader API
- Blob API

## Vue concepts used

The project uses several Vue concepts and patterns, including:

- reusable components
- props
- custom events with `emit`
- `ref`
- `computed`
- `watch`
- `v-model`
- custom `v-model`
- conditional rendering
- list rendering
- event handling
- dynamic classes
- `Teleport`
- `TransitionGroup`
- composables

## Project Structure

```text
src/
├── components/
│   ├── ConfirmModal.vue
│   ├── ProjectCard.vue
│   ├── ProjectFilters.vue
│   └── ProjectForm.vue
│
├── composables/
│   ├── useProjectDragDrop.js
│   ├── useProjectFilters.js
│   ├── useProjectTransfer.js
│   ├── useTheme.js
│   └── useToasts.js
│
├── constants/
│   └── projectStatuses.js
│
├── App.vue
└── main.js
```

## Architecture

Some application logic was extracted from `App.vue` into reusable composables:

- `useProjectFilters` – filtering, searching and sorting
- `useProjectDragDrop` – project drag & drop logic
- `useProjectTransfer` – JSON import and export
- `useTheme` – dark mode state
- `useToasts` – toast notifications

This keeps the main application component smaller and separates independent pieces of application logic.

## Data persistence

Projects are stored in the browser using `localStorage`.

Changes are automatically persisted using Vue's `watch`.

The application also supports exporting the current project list to a JSON file and restoring it later through JSON import.

> The application does not currently use a backend or external database.

## Installation

Clone the repository:

```bash
git clone https://github.com/natalkakielbicka-coder/vue-project-manager.git
```

Go to the project directory:

```bash
cd vue-project-manager
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## About the project

This project was created to practice building a larger application with Vue 3 and to move beyond basic component examples.

During development, the application was gradually expanded and later refactored by extracting independent logic into composables.

## Author

**Natalia Kielbicka**
