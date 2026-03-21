import { Model } from '@nozbe/watermelondb';
import { field, text, json, date, readonly, relation, children } from '@nozbe/watermelondb/decorators';

export class Category extends Model {
  static table = 'categories';

  @text('name') name!: string;
  @text('type') type!: 'income' | 'expense';
  @text('icon') icon!: string;
  @text('color') color!: string;
  @field('parent_id') parentId!: string;
  @field('order') order!: number;
  @field('is_active') isActive!: boolean;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('transactions') transactions!: any[];
  @children('budgets') budgets!: any[];
  
  // Для иерархии категорий
  @relation('categories', 'parent_id') parent!: any;
  @children('categories') subcategories!: any[];
}