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
          <p class="form-help">Press Enter or comma to add tags</p>
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
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag()
  } else if (
    event.key === 'Backspace' &&
    !tagInput.value &&
    tags.value.length > 0
  ) {
    tags.value.pop()
  }
}

const addTag = () => {
  const tag = tagInput.value.trim().replace(/,$/, '')
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
    tagInput.value = ''
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
  max-width: 600px;
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
  padding: var(--space-4);
  border-bottom: 2px solid rgba(139, 69, 19, 0.1);
  flex-shrink: 0;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: var(--space-4);
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: 2px;
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
  text-shadow: 0 1px 2px rgba(139, 69, 19, 0.1);
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
}

.form-group {
  margin-bottom: var(--space-1);
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--color-gray-700);
  margin-bottom: var(--space-1);
}

.tags-input-container {
  position: relative;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.tag.removable {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
  color: white;
  padding: 4px var(--space-2);
  border-radius: 16px;
  font-size: var(--text-sm);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(220, 20, 60, 0.3);
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
  transition: all 0.3s ease;
}

.remove-tag-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.form-help {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  margin-top: var(--space-1);
}

.form-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  margin-top: var(--space-5);
  border-top: 2px solid rgba(139, 69, 19, 0.1);
  padding-top: var(--space-4);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .modal {
    max-height: 95vh;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style>