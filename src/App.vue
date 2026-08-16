<script setup>
import { ref, watch } from 'vue'

const projectName = ref('Moja pierwsza strona')
const projectStatus = ref('Do zrobienia')
const projectDescription = ref('')
const errorMessage = ref('')

const savedProjects = localStorage.getItem('projects')

const projects = ref(savedProjects ? JSON.parse(savedProjects) : [])

watch(
  projects,
  (newProjects) => {
    localStorage.setItem('projects', JSON.stringify(newProjects))
  },
  { deep: true },
)

function addProject() {
  if (projectName.value.trim() === '') {
    errorMessage.value = 'Podaj nazwę projektu'
    return
  }

  errorMessage.value = ''

  const project = {
    id: Date.now(),
    name: projectName.value,
    status: projectStatus.value,
    description: projectDescription.value,
  }

  projects.value.push(project)

  projectName.value = ''
  projectStatus.value = 'Do zrobienia'
  projectDescription.value = ''
}

function deleteProject(id) {
  projects.value = projects.value.filter((project) => project.id !== id)
}
</script>

<template>
  <main class="app">
    <h1>Project Manager</h1>

    <p>Liczba projektów: {{ projects.length }}</p>

    <div class="form-group">
      <label for="project-name">Nazwa projektu</label>

      <input id="project-name" v-model="projectName" type="text" />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    <div class="form-group">
      <label for="project-status">Status</label>

      <select id="project-status" v-model="projectStatus">
        <option>Do zrobienia</option>
        <option>W trakcie</option>
        <option>Gotowe</option>
      </select>
    </div>

    <div class="form-group">
      <label for="project-description">Opis projektu</label>

      <textarea id="project-description" v-model="projectDescription"></textarea>
    </div>

    <button @click="addProject">Dodaj projekt</button>

    <div class="projects">
      <article v-for="project in projects" :key="project.id" class="project-card">
        <h2>{{ project.name }}</h2>
        <p>{{ project.status }}</p>
        <p>{{ project.description }}</p>

        <button @click="deleteProject(project.id)">Usuń</button>
      </article>
    </div>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f5f7fb;
  color: #1f2937;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app {
  width: min(100% - 40px, 900px);
  margin: 0 auto;
  padding: 64px 0;
}

h1 {
  margin: 0 0 8px;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.1;
  letter-spacing: -1.5px;
  color: #111827;
}

.app > p {
  margin-top: 0;
  margin-bottom: 32px;
  color: #6b7280;
}

/* FORMULARZ */

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  background: #ffffff;
  color: #111827;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgb(99 102 241 / 12%);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

/* BUTTON */

button {
  border: 0;
  border-radius: 10px;
  padding: 12px 18px;
  background: #4f46e5;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

button:hover {
  background: #4338ca;
  box-shadow: 0 8px 20px rgb(79 70 229 / 20%);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* BŁĄD */

.error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

/* LISTA PROJEKTÓW */

.projects {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 48px;
}

.project-card {
  position: relative;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgb(17 24 39 / 5%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgb(17 24 39 / 10%);
}

.project-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #111827;
}

.project-card p {
  margin: 0 0 12px;
  line-height: 1.6;
  color: #6b7280;
}

.project-card p:first-of-type {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 16px;
  border-radius: 999px;
  padding: 5px 10px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 700;
}

.project-card button {
  margin-top: 10px;
  padding: 9px 13px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 13px;
}

.project-card button:hover {
  background: #fecaca;
  box-shadow: none;
}

/* MOBILE */

@media (max-width: 650px) {
  .app {
    width: min(100% - 32px, 900px);
    padding: 40px 0;
  }

  .projects {
    grid-template-columns: 1fr;
  }
}
</style>
