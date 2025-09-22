export interface WikiItem {
  id: string;
  name: string;
  tags: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  items: WikiItem[];
  sortOrder: 'alphabetical' | 'tags' | 'date';
  createdAt: Date;
  updatedAt: Date;
}

export interface WikiNotesData {
  categories: Category[];
  lastBackup: Date | null;
}

class StorageService {
  private static instance: StorageService;
  private readonly STORAGE_KEY = 'wikinotes_data';

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private constructor() {}

  getData(): WikiNotesData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Convert date strings back to Date objects
        parsed.categories = parsed.categories.map((cat: any) => ({
          ...cat,
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt),
          items: cat.items.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          }))
        }));
        parsed.lastBackup = parsed.lastBackup ? new Date(parsed.lastBackup) : null;
        return parsed;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    return {
      categories: [],
      lastBackup: null
    };
  }

  saveData(data: WikiNotesData): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  createCategory(name: string): Category {
    const category: Category = {
      id: this.generateId(),
      name,
      items: [],
      sortOrder: 'alphabetical',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const data = this.getData();
    data.categories.push(category);
    this.saveData(data);
    
    return category;
  }

  updateCategory(categoryId: string, updates: Partial<Category>): boolean {
    const data = this.getData();
    const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex !== -1) {
      data.categories[categoryIndex] = {
        ...data.categories[categoryIndex],
        ...updates,
        updatedAt: new Date()
      };
      return this.saveData(data);
    }
    
    return false;
  }

  deleteCategory(categoryId: string): boolean {
    const data = this.getData();
    data.categories = data.categories.filter(cat => cat.id !== categoryId);
    return this.saveData(data);
  }

  createItem(categoryId: string, item: Omit<WikiItem, 'id' | 'createdAt' | 'updatedAt'>): WikiItem | null {
    const newItem: WikiItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const data = this.getData();
    const category = data.categories.find(cat => cat.id === categoryId);
    
    if (category) {
      category.items.push(newItem);
      category.updatedAt = new Date();
      this.saveData(data);
      return newItem;
    }
    
    return null;
  }

  updateItem(categoryId: string, itemId: string, updates: Partial<WikiItem>): boolean {
    const data = this.getData();
    const category = data.categories.find(cat => cat.id === categoryId);
    
    if (category) {
      const itemIndex = category.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        category.items[itemIndex] = {
          ...category.items[itemIndex],
          ...updates,
          updatedAt: new Date()
        };
        category.updatedAt = new Date();
        return this.saveData(data);
      }
    }
    
    return false;
  }

  deleteItem(categoryId: string, itemId: string): boolean {
    const data = this.getData();
    const category = data.categories.find(cat => cat.id === categoryId);
    
    if (category) {
      category.items = category.items.filter(item => item.id !== itemId);
      category.updatedAt = new Date();
      return this.saveData(data);
    }
    
    return false;
  }

  exportData(): string {
    const data = this.getData();
    data.lastBackup = new Date();
    this.saveData(data);
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      
      // Validate the structure
      if (!importedData.categories || !Array.isArray(importedData.categories)) {
        throw new Error('Invalid data structure');
      }
      
      // Convert date strings to Date objects
      importedData.categories = importedData.categories.map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt || new Date()),
        updatedAt: new Date(cat.updatedAt || new Date()),
        items: (cat.items || []).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt || new Date()),
          updatedAt: new Date(item.updatedAt || new Date())
        }))
      }));
      
      importedData.lastBackup = importedData.lastBackup ? new Date(importedData.lastBackup) : null;
      
      return this.saveData(importedData);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  searchItems(query: string): { category: Category; item: WikiItem }[] {
    const data = this.getData();
    const results: { category: Category; item: WikiItem }[] = [];
    
    const lowerQuery = query.toLowerCase();
    
    data.categories.forEach(category => {
      category.items.forEach(item => {
        const nameMatch = item.name.toLowerCase().includes(lowerQuery);
        const descriptionMatch = item.description.toLowerCase().includes(lowerQuery);
        const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        
        if (nameMatch || descriptionMatch || tagMatch) {
          results.push({ category, item });
        }
      });
    });
    
    return results;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default StorageService;