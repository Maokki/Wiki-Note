<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Create New Category</h2>
        <button @click="$emit('close')" class="close-btn">
          <X :size="24" />
        </button>
      </div>
      
      <form @submit.prevent="createCategory" class="modal-body">
        <div class="form-group">
          <label for="categoryName" class="form-label">Category Name</label>
          <input
            id="categoryName"
            v-model="categoryName"
            type="text"
            class="input"
            placeholder="e.g., Animals, Technology, Books..."
            required
            autofocus
          />
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-outline">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!categoryName.trim()">
            <Plus :size="20" />
            Create Category
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, X } from 'lucide-vue-next';
import { useStorage } from '../composables/useStorage';
import type { Category } from '../utils/storage';

const emit = defineEmits<{
  close: [];
  created: [category: Category];
}>();

const { createCategory: create } = useStorage();
const categoryName = ref('');

const createCategory = () => {
  if (!categoryName.value.trim()) return;
  
  const category = create(categoryName.value.trim());
  emit('created', category);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--color-gray-700);
  background-color: var(--color-gray-100);
}

.modal-body {
  padding: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--color-gray-700);
  margin-bottom: var(--space-2);
}

.form-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style>