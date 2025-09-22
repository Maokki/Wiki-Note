// CategoryView.vue
<template>
  <div class="category-view">
    <div class="container">
      <!-- Header -->
      <header class="category-header">
        <div class="header-top">
          <button @click="$emit('back')" class="btn btn-primary">
            <ArrowLeft :size="20" />
            Back
          </button>

          <div class="header-actions">
            <button @click="showAddItem = true" class="btn btn-primary">
              <Plus :size="20" />
              <span class="hidden sm:inline">Add Item</span>
            </button>

            <button @click="toggleFlashcards" class="btn btn-secondary">
              <span v-if="!flashcardMode">Flashcards</span>
              <span v-else>Exit Flashcards</span>
            </button>
          </div>
        </div>

        <div class="category-info">
          <h1 class="category-title">{{ category.name }}</h1>
          <div class="category-meta">
            <span class="meta-item">{{ currentCategory.items.length }} items</span>
            <span class="meta-item">{{ uniqueTags.length }} tags</span>
            <span class="meta-item">Updated {{ formatRelativeTime(currentCategory.updatedAt) }}</span>
          </div>
        </div>

        <!-- Search and Sort Controls -->
        <div v-if="!flashcardMode" class="controls">
          <div class="search-container">
            <div class="relative">
              <Search :size="20" class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search items..."
                class="input search-input"
              />
            </div>
          </div>

          <div class="sort-controls">
            <label class="sort-label">Sort by:</label>
            <select v-model="sortOrder" @change="updateSortOrder" class="sort-select">
              <option value="alphabetical">A-Z</option>
              <option value="date">Date Created</option>
              <option value="tags">Tags</option>
            </select>
          </div>
        </div>

        <!-- Tag Filter -->
        <div v-if="!flashcardMode && uniqueTags.length > 0" class="tag-filter">
          <div class="tag-filter-header">
            <span class="filter-label">Filter by tags:</span>
            <button v-if="selectedTags.length > 0" @click="clearTagFilter" class="clear-filter-btn">
              Clear
            </button>
          </div>
          <div class="tag-filter-list">
            <button
              v-for="tag in uniqueTags"
              :key="tag"
              @click="toggleTag(tag)"
              class="filter-tag"
              :class="{ active: selectedTags.includes(tag) }"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </header>

      <!-- Items or Flashcards List -->
      <main class="items-section">
        <!-- FLASHCARDS MODE -->
        <div v-if="flashcardMode && shuffledFlashcards.length > 0" class="flashcards">
          <div class="flashcard-card" @click="showAnswer = !showAnswer">
            <h3 class="flashcard-content">
              {{ showAnswer ? shuffledFlashcards[activeFlashcardIndex].name : shuffledFlashcards[activeFlashcardIndex].description }}
            </h3>
          </div>

          <div class="flashcard-controls">
            <button @click="prevCard" class="btn btn-outline">Previous</button>
            <button @click="nextCard" class="btn btn-outline">Next</button>
          </div>
        </div>


        <!-- EMPTY OR NO RESULTS -->
        <div v-else-if="filteredItems.length === 0 && currentCategory.items.length === 0" class="empty-state">
          <FileText :size="48" class="empty-icon" />
          <h3 class="text-lg font-medium mb-2">No items yet</h3>
          <p class="text-gray-600 mb-4">Add your first item to start building your knowledge base</p>
          <button @click="showAddItem = true" class="btn btn-primary">
            <Plus :size="20" />
            Add First Item
          </button>
        </div>

        <div v-else-if="filteredItems.length === 0" class="no-results">
          <Search :size="32" class="no-results-icon" />
          <h3 class="text-lg font-medium mb-2">No matching items</h3>
          <p class="text-gray-600">Try adjusting your search or tag filters</p>
        </div>

        <!-- ITEMS GRID -->
        <div v-else class="items-grid">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="item-card"
            @click="openItem(item)"
          >
            <div class="item-header">
              <h3 class="item-title">{{ item.name }}</h3>
              <div class="item-actions">
                <button
                  @click.stop="editItem(item)"
                  class="action-btn edit-btn"
                  title="Edit item"
                >
                  <Edit :size="16" />
                </button>
                <button
                  @click.stop="deleteItem(item.id)"
                  class="action-btn delete-btn"
                  title="Delete item"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <ItemFormModal
      v-if="showAddItem || editingItem"
      :category="currentCategory"
      :item="editingItem"
      @close="closeItemForm"
      @saved="onItemSaved"
    />

    <ItemModal
      v-if="selectedItem"
      :category="currentCategory"
      :item="selectedItem"
      @close="selectedItem = null"
      @edit="editItem"
      @delete="deleteItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeft, Plus, Search, Edit, Trash2, FileText } from 'lucide-vue-next';
import { useStorage } from '../composables/useStorage';
import type { Category, WikiItem } from '../utils/storage';
import ItemFormModal from './ItemFormModal.vue';
import ItemModal from './ItemModal.vue';

interface Props {
  category: Category;
}

const props = defineProps<Props>();

const { categories, updateCategory, deleteItem: removeItem } = useStorage();

const currentCategory = computed(() => {
  return categories.value.find(cat => cat.id === props.category.id) || props.category;
});

const searchQuery = ref('');
const sortOrder = ref(currentCategory.value.sortOrder);
const selectedTags = ref<string[]>([]);
const showAddItem = ref(false);
const editingItem = ref<WikiItem | null>(null);
const selectedItem = ref<WikiItem | null>(null);

// FLASHCARDS STATE
const flashcardMode = ref(false);
const activeFlashcardIndex = ref(0);
const showAnswer = ref(false);

const uniqueTags = computed(() => {
  const tags = new Set<string>();
  currentCategory.value.items.forEach(item => {
    item.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
});

// Filtered items for search/tag/sort
const filteredItems = computed(() => {
  let items = [...currentCategory.value.items];

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (selectedTags.value.length > 0) {
    items = items.filter(item =>
      selectedTags.value.some(tag => item.tags.includes(tag))
    );
  }

  items.sort((a, b) => {
    switch (sortOrder.value) {
      case 'alphabetical': return a.name.localeCompare(b.name);
      case 'date': return b.createdAt.getTime() - a.createdAt.getTime();
      case 'tags': return a.tags.join(', ').localeCompare(b.tags.join(', '));
      default: return 0;
    }
  });

  return items;
});

// METHODS
const updateSortOrder = () => {
  updateCategory(currentCategory.value.id, { sortOrder: sortOrder.value });
};

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) selectedTags.value.splice(index, 1);
  else selectedTags.value.push(tag);
};

const clearTagFilter = () => selectedTags.value = [];

const openItem = (item: WikiItem) => { selectedItem.value = item; };
const editItem = (item: WikiItem) => { editingItem.value = item; selectedItem.value = null; };
const deleteItem = (itemId: string) => {
  if (confirm('Are you sure you want to delete this item?')) {
    removeItem(currentCategory.value.id, itemId);
    if (selectedItem.value?.id === itemId) selectedItem.value = null;
  }
};
const closeItemForm = () => { showAddItem.value = false; editingItem.value = null; };
const onItemSaved = () => closeItemForm();

// FLASHCARD METHODS
// Flashcards array (only items with description)
const shuffledFlashcards = ref<WikiItem[]>([]);

const toggleFlashcards = () => {
  flashcardMode.value = !flashcardMode.value;
  activeFlashcardIndex.value = 0;
  showAnswer.value = false;

  if (flashcardMode.value) {
    // Only include items with description
    const cards = currentCategory.value.items.filter(
      item => item.description && item.description.trim() !== ''
    );
    shuffledFlashcards.value = shuffleArray(cards);
  }
};


const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const nextCard = () => {
  if (activeFlashcardIndex.value < shuffledFlashcards.value.length - 1) activeFlashcardIndex.value++;
  else activeFlashcardIndex.value = 0;
  showAnswer.value = false;
};

const prevCard = () => {
  if (activeFlashcardIndex.value > 0) activeFlashcardIndex.value--;
  else activeFlashcardIndex.value = shuffledFlashcards.value.length - 1;
  showAnswer.value = false;
};


const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Watch for sort order changes
watch(() => currentCategory.value.sortOrder, (newOrder) => {
  sortOrder.value = newOrder;
});
</script>





<style scoped>
.category-view {
  padding-bottom: 80px; /* Space for mobile nav */
}

.category-header {
  border-bottom: 2px solid rgba(139, 69, 19, 0.2);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
  position: relative;
}

.category-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: 2px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-primary);   /* same as action button */
  border: 2px solid var(--color-primary);
  color: white;                       /* white text/icon */
  font-size: var(--text-base);
  cursor: pointer;
  padding: var(--space-1) var(--space-3);
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.back-btn:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateX(-2px);
}

.header-actions {
  display: flex;
  margin: var(--space-1);
  gap: var(--space-2);
}

.category-info {
  margin-bottom: var(--space-4);
}

.category-title {
  font-size: 3rem; /* or try 6rem for scalable size */
  font-weight: 900; /* stronger boldness */
  color: var(--color-gray-900);
  margin-bottom: var(--space-2);
  text-shadow: 0 3px 6px rgba(139, 69, 19, 0.2);
}


.category-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.meta-item {
  color: var(--color-gray-600);
  font-size: var(--text-sm);
  font-weight: 500;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

/* Search Container */
.search-container {
  position: relative;
  max-width: 280px; /* smaller than desktop */
  flex: 1 1 auto;  /* allows shrinking */
}

/* Search Icon */
.search-icon {
  position: absolute;
  left: 6px; /* closer to edge */
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  font-size: 16px; /* smaller icon */
  z-index: 1;
}

/* Search Input */
.search-input {
  width: 100%;
  padding: 6px 8px 6px 34px; /* smaller input box */
  font-size: 0.875rem;       /* smaller text */
  border-radius: 6px;
}

/* Sort Controls */
.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* tighter spacing */
}

/* Sort Label */
.sort-label {
  font-size: 0.875rem; /* smaller label */
}

/* Sort Select */
.sort-select {
  padding: 4px 8px;    /* smaller select box */
  font-size: 0.875rem; /* smaller text */
  border-radius: 6px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.sort-label {
  font-weight: 500;
  color: var(--color-gray-700);
  font-size: var(--text-sm);
}

.sort-select {
  padding: var(--space-1) var(--space-2);
  border: 2px solid var(--color-gray-300);
  border-radius: 6px;
  font-size: var(--text-sm);
  background: rgba(253, 246, 227, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.tag-filter {
  background: linear-gradient(135deg, rgba(245, 230, 211, 0.8) 0%, rgba(232, 213, 183, 0.8) 100%);
  border-radius: 8px;
  padding: var(--space-2);
  border: 1px solid rgba(139, 69, 19, 0.1);
  backdrop-filter: blur(10px);
}

.tag-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.filter-label {
  font-weight: 500;
  color: var(--color-gray-700);
  font-size: var(--text-sm);
}

.clear-filter-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.clear-filter-btn:hover {
  background-color: var(--color-primary);
  color: white;
  transform: scale(1.05);
}

.tag-filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.filter-tag {
  background: rgba(253, 246, 227, 0.9);
  border: 2px solid var(--color-gray-300);
  color: var(--color-gray-700);
  padding: 4px var(--space-2);
  border-radius: 16px;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filter-tag:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.filter-tag.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-color: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.empty-state,
.no-results {
  text-align: center;
  padding: var(--space-6) var(--space-4);
  background: linear-gradient(135deg, rgba(253, 246, 227, 0.95) 0%, rgba(245, 230, 211, 0.95) 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(139, 69, 19, 0.1);
  backdrop-filter: blur(10px);
}

.empty-icon,
.no-results-icon {
  color: var(--color-primary);
  margin: 0 auto var(--space-3);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); /* smaller min width */
  gap: var(--space-2);/* increase spacing between cards */
}

.item-card {
  background: linear-gradient(135deg, rgba(253, 246, 227, 0.95) 0%, rgba(245, 230, 211, 0.95) 100%);
  border-radius: 12px;
  padding: var(--space-1);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid rgba(139, 69, 19, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-secondary) 0%, var(--color-accent) 100%);
}

.item-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(139, 69, 19, 0.3);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-2);
  margin-top: var(--space-1);
}

.item-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-gray-900);
  line-height: 1.3;
  flex: 1;
  margin-right: var(--space-2);
  margin-left: var(--space-1);
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: all 0.3s ease;
}

.item-card:hover .item-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
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

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.item-description {
  color: var(--color-gray-600);
  line-height: 1.5;
  margin-bottom: var(--space-3);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-2);
  border-top: 1px solid rgba(139, 69, 19, 0.2);
  font-size: var(--text-xs);
  color: var(--color-gray-500);
}

.meta-updated {
  font-style: italic;
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .controls {
    gap: var(--space-2);
  }
  
  .sort-controls {
    flex-wrap: wrap;
  }
  
  .category-meta {
    gap: var(--space-2);
  }
  
  .item-actions {
    opacity: 1; /* Always show on mobile */
  }
}

@media (min-width: 768px) {
  .controls {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .search-container {
    flex: 1;
    max-width: 300px;
  }
}

/* FLASHCARDS */
.flashcards {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
}

.flashcard-card {
  width: 100%;
  max-width: 600px;
  min-height: 200px;
  background: linear-gradient(135deg, rgba(253,246,227,0.95) 0%, rgba(245,230,211,0.95) 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  white-space: pre-wrap;
}

.flashcard-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.flashcard-content {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-gray-900);
}

.flashcard-controls {
  display: flex;
  gap: var(--space-2);
}
</style>