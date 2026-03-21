import { database, getCategoriesCollection } from '../../database';
import { Q } from '@nozbe/watermelondb';
import { Category } from '../../database/models/Category';

export interface CreateCategoryDTO {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parentId?: string;
  order?: number;
}

class CategoryService {
  // Создать категорию
  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    return await database.write(async () => {
      const categories = getCategoriesCollection();
      
      // Получаем максимальный order для определения нового
      const existing = await categories
        .query(Q.where('type', data.type))
        .fetch();
      
      const maxOrder = Math.max(...existing.map(c => (c as any).order), 0);

      return await categories.create((category: any) => {
        category.name = data.name;
        category.type = data.type;
        category.icon = data.icon;
        category.color = data.color;
        category.parentId = data.parentId || '';
        category.order = data.order || maxOrder + 1;
        category.isActive = true;
        category.createdAt = Date.now();
        category.updatedAt = Date.now();
      });
    });
  }

  // Получить все категории
  async getAllCategories() {
    const categories = getCategoriesCollection();
    return await categories
      .query(Q.sortBy('order', Q.asc))
      .fetch();
  }

  // Получить активные категории по типу
  async getCategoriesByType(type: 'income' | 'expense') {
    const categories = getCategoriesCollection();
    return await categories
      .query(
        Q.where('type', type),
        Q.where('is_active', true),
        Q.sortBy('order', Q.asc)
      )
      .fetch();
  }

  // Получить иерархию категорий
  async getCategoryTree(type: 'income' | 'expense') {
    const categories = await this.getCategoriesByType(type);
    
    const tree: any[] = [];
    const map: Record<string, any> = {};

    // Сначала создаем маппинг
    categories.forEach((cat: any) => {
      map[cat.id] = { 
        ...cat,
        _raw: cat._raw,
        children: [] 
      };
    });

    // Строим дерево
    categories.forEach((cat: any) => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });

    return tree;
  }

  // Получить категорию по ID
  async getCategoryById(id: string) {
    const categories = getCategoriesCollection();
    return await categories.find(id);
  }

  // Обновить категорию
  async updateCategory(id: string, data: Partial<CreateCategoryDTO>) {
    return await database.write(async () => {
      const categories = getCategoriesCollection();
      const category = await categories.find(id);
      return await category.update((record: any) => {
        if (data.name !== undefined) record.name = data.name;
        if (data.icon !== undefined) record.icon = data.icon;
        if (data.color !== undefined) record.color = data.color;
        if (data.parentId !== undefined) record.parentId = data.parentId;
        if (data.order !== undefined) record.order = data.order;
        record.updatedAt = Date.now();
      });
    });
  }

  // Удалить категорию (помечаем как неактивную)
  async deactivateCategory(id: string) {
    return await database.write(async () => {
      const categories = getCategoriesCollection();
      const category = await categories.find(id);
      return await category.update((record: any) => {
        record.isActive = false;
        record.updatedAt = Date.now();
      });
    });
  }

  // Активировать категорию
  async activateCategory(id: string) {
    return await database.write(async () => {
      const categories = getCategoriesCollection();
      const category = await categories.find(id);
      return await category.update((record: any) => {
        record.isActive = true;
        record.updatedAt = Date.now();
      });
    });
  }
}

export default new CategoryService();