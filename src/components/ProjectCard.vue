<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete'])
</script>

<template>
  <article class="project-card">
    <h2>{{ project.name }}</h2>

    <p
      class="project-status"
      :class="{
        'status-todo': project.status === 'Do zrobienia',
        'status-progress': project.status === 'W trakcie',
        'status-done': project.status === 'Gotowe',
      }"
    >
      {{ project.status }}
    </p>

    <p>{{ project.description }}</p>

    <div class="project-actions">
      <button class="edit-button" @click="$emit('edit', project)">Edytuj</button>

      <button class="delete-button" @click="$emit('delete', project.id)">Usuń</button>
    </div>
  </article>
</template>
