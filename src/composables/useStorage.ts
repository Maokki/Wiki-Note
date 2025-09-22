import { ref, computed } from 'vue';
import StorageService, { type WikiNotesData, type Category, type WikiItem } from '../utils/storage';

const storage = StorageService.getInstance();
const data = ref<WikiNotesData>(storage.getData());

export function useStorage() {
  const categories = computed(() => data.value.categories);
  
  const totalItems = computed(() => {
    return data.value.categories.reduce((total, category) => total + category.items.length, 0);
  });

  const recentItems = computed(() => {
    const allItems: { category: Category; item: WikiItem }[] = [];
    data.value.categories.forEach(category => {
      category.items.forEach(item => {
        allItems.push({ category, item });
      });
    });
    
    return allItems
      .sort((a, b) => b.item.updatedAt.getTime() - a.item.updatedAt.getTime())
      .slice(0, 5);
  });

  const refreshData = () => {
    data.value = storage.getData();
  };

  const createCategory = (name: string) => {
    const category = storage.createCategory(name);
    refreshData();
    return category;
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    const success = storage.updateCategory(categoryId, updates);
    if (success) refreshData();
    return success;
  };

  const deleteCategory = (categoryId: string) => {
    const success = storage.deleteCategory(categoryId);
    if (success) refreshData();
    return success;
  };

  const createItem = (categoryId: string, item: Omit<WikiItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem = storage.createItem(categoryId, item);
    refreshData(); // Always refresh to ensure reactivity
    return newItem;
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<WikiItem>) => {
    const success = storage.updateItem(categoryId, itemId, updates);
    refreshData(); // Always refresh to ensure reactivity
    return success;
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    const success = storage.deleteItem(categoryId, itemId);
    refreshData(); // Always refresh to ensure reactivity
    return success;
  };

  const exportData = () => {
    return storage.exportData();
  };

  const importData = (jsonData: string) => {
    const success = storage.importData(jsonData);
    if (success) refreshData();
    return success;
  };

  const searchItems = (query: string) => {
    return storage.searchItems(query);
  };

  return {
    data,
    categories,
    totalItems,
    recentItems,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    exportData,
    importData,
    searchItems,
    refreshData
  };
}