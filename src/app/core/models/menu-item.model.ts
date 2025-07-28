export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}