<script setup>
defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
  selectedStatus: {
    type: String,
    required: true,
  },
  sortBy: {
    type: String,
    required: true,
  },
  statuses: {
    type: Array,
    required: true,
  },
  statusCounts: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:searchQuery', 'update:selectedStatus', 'update:sortBy'])
</script>

<template>
  <div class="filters">
    <input
      :value="searchQuery"
      class="search"
      type="text"
      placeholder="Szukaj projektu..."
      @input="emit('update:searchQuery', $event.target.value)"
    />

    <button
      v-for="status in statuses"
      :key="status"
      :class="{ active: selectedStatus === status }"
      @click="emit('update:selectedStatus', status)"
    >
      {{ status }}

      <span class="filter-count">
        {{ statusCounts[status] }}
      </span>
    </button>

    <select :value="sortBy" class="sort" @change="emit('update:sortBy', $event.target.value)">
      <option value="newest">Najnowsze</option>
      <option value="oldest">Najstarsze</option>
      <option value="name">Nazwa A–Z</option>
    </select>
  </div>
</template>
