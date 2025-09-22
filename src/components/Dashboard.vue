//dasboard.vue
<template>
  <div class="dashboard">
    <div class="container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="dashboard-title">WikiNotes</h1>
            <p class="dashboard-description">Your personal knowledge base</p>
          </div>
<button 
  @click="showExportImport = true" 
  class="btn btn-outline backup-btn"
>
  <Download class="backup-icon" />
  <span class="backup-label"></span>
</button>
        </div>

<!-- Search -->
<div class="search-container mb-4">
  <input
    v-model="searchQuery"
    type="text"
    placeholder="🔎︎ Search notes..."
    class="search-input"
  />
</div>

      </header>

      <!-- Search Results -->
      <div v-if="searchQuery && searchResults.length > 0" class="search-results mb-6">
        <h2 class="text-xl font-semibold mb-3">Search Results</h2>
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="result in searchResults"
            :key="result.item.id"
            class="card search-result-item"
            @click="openItem(result.category, result.item)"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-medium">{{ result.item.name }}</h3>
              <span class="text-sm text-gray-500">{{ result.category.name }}</span>
            </div>
            <div class="flex flex-wrap gap-1 mb-2">
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <section v-if="!searchQuery" class="categories-section">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold">Categories</h2>
          <button @click="showCreateCategory = true" class="btn btn-primary">
            <Plus :size="20" />
            <span class="hidden sm:inline">New Category</span>
          </button>
        </div>

        <div v-if="categories.length === 0" class="empty-state">
          <BookOpen :size="48" class="empty-icon" />
          <h3 class="text-lg font-medium mb-2">No categories yet</h3>
          <p class="text-gray-600 mb-4">Create your first category to start organizing your notes</p>
          <button @click="showCreateCategory = true" class="btn btn-primary">
            <Plus :size="20" />
            Create Category
          </button>
        </div>

        <div v-else class="categories-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            @click="openCategory(category)"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="category-title">{{ category.name }}</h3>
              <button
                @click.stop="deleteCategory(category.id)"
                class="delete-btn"
                title="Delete category"
              >
                <Trash2 :size="16" />
              </button>
            </div>
            <div class="category-stats">
              <div class="stat">
                <span class="stat-value">{{ category.items.length }}</span>
                <span class="stat-text"> つ</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modals -->
    <CreateCategoryModal
      v-if="showCreateCategory"
      @close="showCreateCategory = false"
      @created="onCategoryCreated"
    />

    <ExportImportModal
      v-if="showExportImport"
      @close="showExportImport = false"
    />

    <ItemModal
      v-if="selectedItem"
      :category="selectedCategory!"
      :item="selectedItem"
      @close="selectedItem = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Plus, BookOpen, Trash2, Download } from 'lucide-vue-next';
import { useStorage } from '../composables/useStorage';
import type { Category, WikiItem } from '../utils/storage';
import CreateCategoryModal from './CreateCategoryModal.vue';
import ExportImportModal from './ExportImportModal.vue';
import ItemModal from './ItemModal.vue';

const emit = defineEmits(['openCategory']);

const {
  categories,
  deleteCategory: removeCategory,
  searchItems
} = useStorage();

const searchQuery = ref('');
const showCreateCategory = ref(false);
const showExportImport = ref(false);
const selectedItem = ref<WikiItem | null>(null);
const selectedCategory = ref<Category | null>(null);


const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];
  return searchItems(searchQuery.value);
});

const openCategory = (category: Category) => {
  emit('openCategory', category);
};

const openItem = (category: Category, item: WikiItem) => {
  selectedCategory.value = category;
  selectedItem.value = item;
};

const deleteCategory = (categoryId: string) => {
  if (confirm('Are you sure you want to delete this category and all its items?')) {
    removeCategory(categoryId);
  }
};

const onCategoryCreated = (category: Category) => {
  showCreateCategory.value = false;
  openCategory(category);
};

// Clear search when navigating away
watch(() => searchQuery.value, (newValue) => {
  if (!newValue.trim()) {
    // Clear search results
  }
});
</script>

<style scoped>
/* ===========================
   Dashboard Layout
=========================== */
.dashboard-title {
  font-size: clamp(2rem, 5vw, 4.5rem);
  font-weight: 900;
  line-height: 1.1;
  margin: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 2px;

  /* Dark brown glow */
  color: rgb(139, 69, 19); /* SaddleBrown */
  text-shadow:
    0 0 6px #2b1a0e,
    0 0 14px #3e2616,
    0 0 28px #5c3620,
    0 0 45px #7a452a;

  font-family: 'Sakura Brush', 'Orbitron', 'Brush Script MT', cursive, sans-serif;
}

/* Responsive adjustments for smaller devices (like Oppo) */
@media (max-width: 480px) {
  .dashboard-title {
    font-size: clamp(1.8rem, 6vw, 2.5rem);
    letter-spacing: 1px;
    text-shadow:
      0 0 4px #2b1a0e,
      0 0 10px #3e2616,
      0 0 18px #5c3620;
    margin: var(--space-1);
  }
}

@media (max-width: 360px) {
  .dashboard-title {
    font-size: clamp(1.5rem, 6vw, 2rem);
    letter-spacing: 0.5px;
    text-shadow:
      0 0 3px #2b1a0e,
      0 0 8px #3e2616,
      0 0 14px #5c3620;
  }
}


.dashboard-description {
  font-size: clamp(0.7rem, 2vw, 1.4rem); /* slightly larger */
  font-weight: 600;
  margin: var(--space-1);
  color: #444; /* darker for better contrast */
  letter-spacing: 0.5px;
  font-family: 'Comic Sans MS', 'Fredoka One', 'Patrick Hand', cursive, sans-serif;
}

/* ===========================
   Search Bar
=========================== */
.search-container {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 12px; /* no need for extra padding for icon */
  border-radius: 8px;
  background: rgba(253, 246, 227, 0.95);
  border: 2px solid var(--color-gray-300);
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(139, 69, 19, 0.1);
  outline: none;
}

/* Tablet */
@media (max-width: 768px) {
  .search-input {
    font-size: 0.95rem;
    padding: 9px 12px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .search-input {
    font-size: 0.9rem;
    padding: 8px 10px;
    border-radius: 6px;
  }
}


/* ===========================
   Categories
=========================== */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-2);
}

.category-card {
  background: linear-gradient(135deg, rgba(253, 246, 227, 0.95), rgba(245, 230, 211, 0.95));
  border-radius: 12px;
  padding: var(--space-2);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid rgba(139, 69, 19, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
}

.category-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(139, 69, 19, 0.3);
}

.category-title {
  font-size: clamp(1.25rem, 2vw, 2rem);
  font-weight: 900;
  color: var(--color-gray-900);
}

.category-stats {
  display: flex;
  gap: var(--space-0);
  margin-bottom: var(--space-0);
}

.stat-value {
  font-weight: 600;
  gap: 4px;
  color: var(--color-primary);
}

.stat-text {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

/* Delete button */
.delete-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.delete-btn:hover {
  color: var(--color-error);
  background-color: rgba(220, 20, 60, 0.1);
  transform: scale(1.1);
}

/* ===========================
   Search Results
=========================== */
.search-results {
  background: linear-gradient(135deg, rgba(249, 238, 207, 0.95), rgba(245, 230, 211, 0.95));
  border-radius: 10px;
  padding: var(--space-2);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(139, 69, 19, 0.1);
  backdrop-filter: blur(10px);
}

.search-result-item,
.recent-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-result-item:hover,
.recent-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* ===========================
   Backup Button
=========================== */
.backup-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.backup-btn:hover {
  background: rgba(18, 177, 18, 0.08);
  border-color: rgb(18, 177, 18);
  transform: translateY(-2px);
}

.backup-icon {
  width: 18px;
  height: 18px;
}

/* ===========================
   Responsive Adjustments
=========================== */

/* Tablet */
@media (max-width: 1024px) {
  .categories-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
}

/* Mobile Large */
@media (max-width: 768px) {
  .dashboard-header { flex-direction: column; align-items: center; text-align: center; }
  .categories-grid { grid-template-columns: 1fr; }
  .search-container { width: 100%; }

  /* Backup button */
  .backup-btn { padding: 6px 10px; font-size: 0.85rem; }
  .backup-label { display: none; }
}

/* Mobile Small */
@media (max-width: 480px) {
  .search-input { font-size: 0.9rem; padding: var(--space-2); }
  .btn { font-size: 0.9rem; padding: var(--space-1) var(--space-2); }
}

/* Short screens (landscape phones) */
@media (max-height: 500px) {
  .dashboard { padding-bottom: 40px; }
}

</style>