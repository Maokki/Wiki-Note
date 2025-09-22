<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Export / Import Data</h2>
        <button @click="$emit('close')" class="close-btn">
          <X :size="24" />
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Export Section -->
        <div class="section">
          <h3 class="section-title">Export Your Data</h3>
          <p class="section-description">
            Download your WikiNotes data as a JSON file for backup or sharing.
          </p>
          <button @click="exportData" class="btn btn-primary full-width">
            <Download :size="20" />
            Export Data
          </button>
        </div>

        <!-- Import Section -->
        <div class="section">
          <h3 class="section-title">Import Data</h3>
          <p class="section-description">
            Import WikiNotes data from a JSON file. This will replace your current data.
          </p>
          <div class="file-input-wrapper">
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileSelect"
              class="file-input"
              id="importFile"
            />
            <label for="importFile" class="btn btn-outline full-width">
              <Upload :size="20" />
              Choose File
            </label>
          </div>
          
          <div v-if="selectedFile" class="selected-file">
            <FileText :size="16" />
            <span>{{ selectedFile.name }}</span>
            <button @click="clearFile" class="clear-file-btn">
              <X :size="16" />
            </button>
          </div>
          
          <button
            v-if="selectedFile"
            @click="importData"
            class="btn btn-secondary full-width"
            :disabled="importing"
          >
            <Upload :size="20" />
            {{ importing ? 'Importing...' : 'Import Data' }}
          </button>
        </div>

        <!-- Warning -->
        <div class="warning">
          <AlertTriangle :size="20" />
          <div>
            <p class="warning-title">Important</p>
            <p class="warning-text">
              Importing data will completely replace your current notes and categories. 
              Make sure to export your current data first if you want to keep it.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Download, Upload, FileText, AlertTriangle, X } from 'lucide-vue-next';
import { useStorage } from '../composables/useStorage';

const emit = defineEmits<{
  close: [];
}>();

const { exportData: export_, importData: import_ } = useStorage();
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const importing = ref(false);

const exportData = () => {
  try {
    const data = export_();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wikinotes-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Error exporting data. Please try again.');
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const clearFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const importData = async () => {
  if (!selectedFile.value) return;
  
  importing.value = true;
  
  try {
    const text = await selectedFile.value.text();
    const success = import_(text);
    
    if (success) {
      alert('Data imported successfully!');
      emit('close');
      // Refresh the page to show new data
      window.location.reload();
    } else {
      alert('Error importing data. Please check the file format and try again.');
    }
  } catch (error) {
    console.error('Error importing data:', error);
    alert('Error importing data. Please check the file format and try again.');
  } finally {
    importing.value = false;
  }
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
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
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

.section {
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: var(--space-2);
}

.section-description {
  color: var(--color-gray-600);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}

.full-width {
  width: 100%;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  margin: var(--space-3) 0;
  font-size: var(--text-sm);
}

.clear-file-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  margin-left: auto;
  transition: all 0.2s ease;
}

.clear-file-btn:hover {
  color: var(--color-error);
  background-color: var(--color-gray-200);
}

.warning {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3);
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 8px;
  color: #92400E;
}

.warning-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.warning-text {
  font-size: var(--text-sm);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .modal {
    max-height: 95vh;
  }
}
</style>