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

<style scoped>
.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 40px;
}

.search {
  flex: 1 1 260px;
  min-width: 220px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 11px 14px;
  font: inherit;
}

.filters button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  background: #ffffff;
  color: #4b5563;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.filters button.active {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
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
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 14px;
  background: #ffffff;
  font: inherit;
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
