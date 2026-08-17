<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal">
      <h2>Usuń projekt</h2>

      <p>{{ message }}</p>

      <div class="modal-actions">
        <button class="cancel-button" @click="$emit('cancel')">Anuluj</button>

        <button class="delete-button" @click="$emit('confirm')">Usuń</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(17 24 39 / 50%);
}

.modal {
  width: min(100%, 420px);
  padding: 28px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgb(0 0 0 / 20%);
}

.modal h2 {
  margin: 0 0 12px;
  font-size: 22px;
}

.modal p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.modal-actions button {
  border: 0;
  border-radius: 10px;
  padding: 10px 16px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  background: #e5e7eb;
  color: #374151;
}

.delete-button {
  background: #dc2626;
  color: #ffffff;
}
</style>
