//ItemFormModal.vue
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditing ? 'Edit Item' : 'Add New Item' }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <X :size="24" />
        </button>
      </div>
      
      <form @submit.prevent="saveItem" class="modal-body">
        <div class="form-group">
          <label for="itemName" class="form-label">Name *</label>
          <input
            id="itemName"
            v-model="itemName"
            type="text"
            class="input"
            required
            autofocus
          />
        </div>
        
        <div class="form-group">
          <label for="itemTags" class="form-label">Tags</label>
          <div class="tags-input-container">
            <input
              id="itemTags"
              v-model="tagInput"
              type="text"
              class="input"
              @keydown="handleTagInput"
              @input="handleTagInputChange"
              placeholder="Add tags (press Enter or comma to separate)"
            />
            <div v-if="tags.length > 0" class="tags-list">
              <span v-for="tag in tags" :key="tag" class="tag removable">
                {{ tag }}
                <button type="button" @click="removeTag(tag)" class="remove-tag-btn">
                  <X :size="14" />
                </button>
              </span>
            </div>
          </div>
          <p class="form-help">Press Enter, comma, or space to add tags</p>
        </div>
        
        <div class="form-group">
          <label for="itemDescription" class="form-label">Description *</label>
          <textarea
            id="itemDescription"
            v-model="description"
            class="input textarea"
            rows="6"
            required
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-outline">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
            <Save :size="20" />
            {{ isEditing ? 'Save Changes' : 'Add Item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Save, X } from 'lucide-vue-next'
import { useStorage } from '../composables/useStorage'
import type { Category, WikiItem } from '../utils/storage'

const props = defineProps<{
  category: Category
  item?: WikiItem | null
}>()

const emit = defineEmits<{
  close: []
  saved: [item: WikiItem]
}>()

const { createItem, updateItem } = useStorage()

const itemName = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const description = ref('')

const isEditing = computed(() => !!props.item)

const isFormValid = computed(() =>
  itemName.value.trim() && description.value.trim()
)

const handleTagInput = (event: KeyboardEvent) => {
  // Handle both desktop and mobile keyboards
  if (event.key === 'Enter' || event.key === ',' || event.key === 'Go' || event.key === 'Done') {
    event.preventDefault()
    addTag()
  }
  // Handle mobile comma input - check for comma in the input value
  else if (tagInput.value.includes(',')) {
    event.preventDefault()
    // Split by comma and add all tags
    const tags = tagInput.value.split(',').map(t => t.trim()).filter(t => t)
    tags.forEach(tag => {
      if (tag && !tags.value.includes(tag)) {
        tags.value.push(tag)
      }
    })
    tagInput.value = ''
  }
  else if (
    event.key === 'Backspace' &&
    !tagInput.value &&
    tags.value.length > 0
  ) {
    tags.value.pop()
  }
}

const addTag = () => {
  // Handle multiple tags separated by commas
  const inputTags = tagInput.value.split(',').map(t => t.trim()).filter(t => t)
  
  inputTags.forEach(tag => {
    if (tag && !tags.value.includes(tag)) {
      tags.value.push(tag)
    }
  })
  
  tagInput.value = ''
}

// Handle input changes for mobile keyboards
const handleTagInputChange = () => {
  // Auto-add tags when comma is detected
  if (tagInput.value.includes(',')) {
    addTag()
  }
}

const removeTag = (tag: string) => {
  const index = tags.value.indexOf(tag)
  if (index > -1) tags.value.splice(index, 1)
}

const saveItem = () => {
  if (!isFormValid.value) return

  if (tagInput.value.trim()) {
    addTag()
  }

  const itemData = {
    name: itemName.value.trim(),
    tags: tags.value,
    description: description.value.trim(),
  }

  let savedItem: WikiItem

  if (isEditing.value && props.item) {
    updateItem(props.category.id, props.item.id, itemData)
    savedItem = { ...props.item, ...itemData }
  } else {
    const created = createItem(props.category.id, itemData)
    if (!created) return
    savedItem = created
  }

  emit('saved', savedItem)
  emit('close')
}

onMounted(() => {
  if (props.item) {
    itemName.value = props.item.name
    tags.value = [...props.item.tags]
    description.value = props.item.description
  }
})

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
  backdrop-filter: blur(12px);
}

.modal {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-gray-200);
  backdrop-filter: blur(20px);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
  flex-shrink: 0;
  position: relative;
  background: rgba(255, 255, 255, 0.8);
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: var(--space-6);
  width: 60px;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: 3px;
}

.modal-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
  letter-spacing: -0.01em;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: var(--space-3);
  font-size: var(--text-base);
}

.tags-input-container {
  position: relative;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.tag.removable {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--gradient-maomao);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: 20px;
  font-size: var(--text-sm);
  font-weight: 500;
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-maomao-dark);
}

.remove-tag-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 18px;
  height: 18px;
}

.remove-tag-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.form-help {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  margin-top: var(--space-2);
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-8);
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--space-6);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .modal {
    max-height: 95vh;
    border-radius: 16px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .btn {
    width: 100%;
  }
  
  .modal-header,
  .modal-body {
    padding: var(--space-4);
  }
}
</style>