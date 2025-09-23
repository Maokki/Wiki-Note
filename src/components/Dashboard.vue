//dasboard.vue
<template>
  <div class="dashboard">
    <div class="container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <div>
            <div class="title-container">
              <h1 class="dashboard-title">
                📚 StudyNotes
                <span class="maomao-emoji">🧪</span>
              </h1>
              <p class="dashboard-subtitle">Curious minds learn better</p>
            </div>
            <p class="dashboard-description">Your personal study companion inspired by Maomao's curiosity</p>
          </div>
          <button 
            @click="showExportImport = true" 
            class="btn btn-maomao backup-btn"
          >
            <Download :size="18" />
            <span class="backup-label">Backup</span>
          </button>
        </div>

        <!-- Search -->
        <div class="search-container">
          <div class="search-wrapper">
            <Search :size="20" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search your study notes..."
              class="search-input"
            />
          </div>
        </div>

      </header>

      <!-- Search Results -->
      <div v-if="searchQuery && searchResults.length > 0" class="search-results mb-6">
        <h2 class="results-title">🔍 Search Results</h2>
        <div class="results-grid">
          <div
            v-for="result in searchResults"
            :key="result.item.id"
            class="result-card"
            @click="openItem(result.category, result.item)"
          >
            <div class="result-header">
              <h3 class="result-title">{{ result.item.name }}</h3>
              <span class="result-category">{{ result.category.name }}</span>
            </div>
            <div class="result-tags">
              <span v-for="tag in result.item.tags.slice(0, 3)" :key="tag" class="result-tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <section v-if="!searchQuery" class="categories-section">
        <div class="section-header">
          <h2 class="section-title">📖 Study Categories</h2>
          <button @click="showCreateCategory = true" class="btn btn-primary">
            <Plus :size="20" />
            <span class="btn-text">New Category</span>
          </button>
        </div>

        <div v-if="categories.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3 class="empty-title">Ready to start studying?</h3>
          <p class="empty-description">Create your first study category and begin your learning journey like Maomao!</p>
          <button @click="showCreateCategory = true" class="btn btn-primary">
            <Plus :size="20" />
            Start Learning
          </button>
        </div>

        <div v-else class="categories-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            @click="openCategory(category)"
          >
            <div class="category-header">
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
                <span class="stat-number">{{ category.items.length }}</span>
                <span class="stat-label">{{ category.items.length === 1 ? 'note' : 'notes' }}</span>
              </div>
              <div class="category-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: Math.min(category.items.length * 10, 100) + '%' }"
                  ></div>
                </div>
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
import { Plus, BookOpen, Trash2, Download, Search } from 'lucide-vue-next';
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
.dashboard {
  padding-bottom: 80px;
}

.dashboard-header {
  margin-bottom: var(--space-8);
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.title-container {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.dashboard-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-maomao) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.maomao-emoji {
  font-size: 0.6em;
  margin-left: var(--space-2);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
  60% { transform: translateY(-3px); }
}

.dashboard-subtitle {
  font-size: var(--text-sm);
  color: var(--color-secondary);
  font-weight: 600;
  font-style: italic;
  text-shadow: 0 1px 2px rgba(139, 69, 19, 0.1);
}

.dashboard-description {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-gray-600);
  letter-spacing: -0.01em;
}

.search-container {
  width: 100%;
  max-width: 600px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  color: var(--color-gray-400);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--space-4) var(--space-4) var(--space-4) var(--space-12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--color-gray-200);
  font-size: var(--text-base);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  outline: none;
  background: rgba(255, 255, 255, 1);
}

.search-results {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-gray-200);
  backdrop-filter: blur(10px);
}

.results-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: var(--space-4);
}

.results-grid {
  display: grid;
  gap: var(--space-3);
}

.result-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.result-title {
  font-weight: 600;
  color: var(--color-gray-900);
}

.result-category {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  background: var(--color-gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: 8px;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.result-tag {
  font-size: var(--text-xs);
  background: var(--gradient-maomao);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-gray-900);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.category-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--color-gray-200);
  border-radius: 16px;
  padding: var(--space-6);
  box-shadow: var(--shadow-base);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.category-card:hover::before {
  opacity: 1;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.category-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-gray-900);
  letter-spacing: -0.01em;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stat {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  font-weight: 500;
}

.category-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--color-gray-200);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-secondary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
}

.category-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-gray-200);
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: var(--space-2);
}

.empty-description {
  color: var(--color-gray-600);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

.backup-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.backup-label {
  font-weight: 600;
}

.btn-text {
  display: inline;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .dashboard-title {
    font-size: clamp(1.8rem, 6vw, 2.5rem);
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-text {
    display: none;
  }
  
  .backup-label {
    display: none;
  }
  
  .search-container {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .title-container {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }
  
  .dashboard-subtitle {
    margin-left: 0;
  }
}

@media (max-width: 360px) {
  .dashboard-title {
    font-size: clamp(1.5rem, 8vw, 2rem);
  }
}

@media (max-height: 500px) {
  .dashboard {
    padding-bottom: 40px;
  }
}
</style>