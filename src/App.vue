<template>
  <div id="app">
    <main class="main-content">
      <!-- Dashboard View -->
      <Dashboard
        v-if="currentView === 'dashboard'"
        @open-category="openCategory"
      />
      
      <!-- Category View -->
      <CategoryView
        v-else-if="currentView === 'category' && selectedCategory"
        :category="selectedCategory"
        @back="goToDashboard"
      />
      
      <!-- Fallback -->
      <div v-else class="error-view">
        <h1>View not found</h1>
        <button @click="goToDashboard" class="btn btn-primary">Go to Dashboard</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dashboard from './components/Dashboard.vue';
import CategoryView from './components/CategoryView.vue';
import type { Category } from './utils/storage';

const currentView = ref('dashboard');
const selectedCategory = ref<Category | null>(null);

const openCategory = (category: Category) => {
  selectedCategory.value = category;
  currentView.value = 'category';
};

const goToDashboard = () => {
  currentView.value = 'dashboard';
  selectedCategory.value = null;
};


// Handle browser back button
window.addEventListener('popstate', () => {
  goToDashboard();
});
</script>

<style>
.main-content {
  flex: 1;
  min-height: 100vh;
}

.error-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-4);
  text-align: center;
}

.error-view h1 {
  color: var(--color-gray-600);
  margin-bottom: var(--space-4);
}
</style>