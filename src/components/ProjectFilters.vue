<script setup>
const searchQuery = defineModel('searchQuery')
const selectedStatus = defineModel('selectedStatus')
const sortBy = defineModel('sortBy')
defineProps({
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
    <input v-model="searchQuery" class="search" type="text" placeholder="Szukaj projektu..." />

    <button
      v-for="status in statuses"
      :key="status"
      :class="{ active: selectedStatus === status }"
      @click="selectedStatus = status"
    >
      {{ status }}

      <span class="filter-count">
        {{ statusCounts[status] }}
      </span>
    </button>

    <select v-model="sortBy" class="sort">
      <option value="newest">Najnowsze</option>
      <option value="oldest">Najstarsze</option>
      <option value="name">Nazwa A–Z</option>
      <option value="custom">Własna kolejność</option>
    </select>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search {
  flex: 1 1 260px;
  min-width: 220px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px 14px;
  font: inherit;
}

.filters button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.filters button.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
}

.filters button.active .filter-count {
  background: rgb(255 255 255 / 20%);
  color: #ffffff;
}

.sort {
  width: auto;
  min-width: 150px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  padding: 10px 14px;
  background: var(--surface);
  font: inherit;
}

.sort option {
  background: var(--surface);
  color: var(--text);
}

@media (max-width: 767px) {
  .filters {
    align-items: stretch;
  }

  .search {
    flex-basis: 100%;
    width: 100%;
  }

  .filters button {
    flex: 1 1 auto;
  }

  .sort {
    width: 100%;
  }
}
</style>
