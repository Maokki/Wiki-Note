//ItemModal.vue
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ item.name }}</h2>
        <div class="header-actions">
          <button @click="$emit('close')" class="close-btn">
            <X :size="24" />
          </button>
        </div>
      </div>
      
      <div class="modal-body">
        <!-- Tags -->
        <div v-if="item.tags.length > 0" class="tags-section">
          <div class="tags-list">
            <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        
        <!-- Description -->
        <div class="description-section">
          <div class="description-content">{{ item.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { Category, WikiItem } from '../utils/storage'

defineProps<{
  category: Category
  item: WikiItem
}>()

</script>



<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(139, 69, 19, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  backdrop-filter: blur(8px);
}

.modal {
  background: linear-gradient(135deg, rgba(253, 246, 227, 0.98) 0%, rgba(245, 230, 211, 0.98) 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 2px solid rgba(139, 69, 19, 0.2);
  backdrop-filter: blur(15px);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  padding-bottom: 8px; 
  margin-bottom: 0; 
  flex-shrink: 0;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: var(--space-3);
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: 2px;
}

.modal-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
  flex: 1;
  margin-right: var(--space-1);
  text-shadow: 0 1px 2px rgba(139, 69, 19, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  color: var(--color-primary);
}

.edit-btn:hover {
  background-color: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.delete-btn {
  color: var(--color-error);
}

.delete-btn:hover {
  background-color: var(--color-error);
  color: white;
  transform: scale(1.1);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: var(--color-gray-700);
  background-color: rgba(139, 69, 19, 0.1);
  transform: scale(1.1);
}

.modal-body {
  padding: var(--space-2);
  overflow-y: auto;
  flex: 1;
  padding-top: 8px; 
  margin-top: 0; 
}

.tags-section {
  margin-bottom: var(--space-1);
  padding-bottom: var(--space-1);
  padding-top: var(--space--1);
  border-bottom: 1px solid rgba(139, 69, 19, 0.2);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.description-section {
  margin-bottom: var(--space-4);
}

.description-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-gray-700);
  font-size: var(--text-base);
}

.description-content :deep(p) {
  margin-bottom: var(--space-3);
}

.description-content :deep(p:last-child) {
  margin-bottom: 0;
}

.meta-section {
  border-top: 1px solid rgba(139, 69, 19, 0.2);
  padding-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}

.meta-label {
  color: var(--color-gray-600);
  font-weight: 500;
}

.meta-value {
  color: var(--color-gray-900);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .modal {
    max-height: 95vh;
  }
  
  .modal-title {
    font-size: var(--text-xl);
  }
  
  .meta-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>