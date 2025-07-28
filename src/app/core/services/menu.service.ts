import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { MenuItem, MenuCategory } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  private categoriesSubject = new BehaviorSubject<MenuCategory[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public menuItems$ = this.menuItemsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  // Mock data
  private mockCategories: MenuCategory[] = [
    { id: '1', name: 'Appetizers', description: 'Start your meal right', displayOrder: 1, isActive: true },
    { id: '2', name: 'Main Courses', description: 'Hearty and satisfying dishes', displayOrder: 2, isActive: true },
    { id: '3', name: 'Desserts', description: 'Sweet endings', displayOrder: 3, isActive: true },
    { id: '4', name: 'Beverages', description: 'Refreshing drinks', displayOrder: 4, isActive: true },
    { id: '5', name: 'Salads', description: 'Fresh and healthy options', displayOrder: 5, isActive: true }
  ];

  private mockMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan cheese, croutons, and our signature caesar dressing',
      price: 12.99,
      category: this.mockCategories[0],
      isAvailable: true,
      preparationTime: 10,
      ingredients: ['Romaine lettuce', 'Parmesan cheese', 'Croutons', 'Caesar dressing'],
      allergens: ['Dairy', 'Gluten'],
      nutritionalInfo: { calories: 250, protein: 8, carbs: 15, fat: 18, fiber: 4 },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Grilled Salmon',
      description: 'Atlantic salmon grilled to perfection, served with seasonal vegetables and rice',
      price: 24.99,
      category: this.mockCategories[1],
      isAvailable: true,
      preparationTime: 20,
      ingredients: ['Atlantic salmon', 'Seasonal vegetables', 'Jasmine rice', 'Lemon'],
      allergens: ['Fish'],
      nutritionalInfo: { calories: 420, protein: 35, carbs: 25, fat: 22, fiber: 3 },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
      price: 8.99,
      category: this.mockCategories[2],
      isAvailable: true,
      preparationTime: 15,
      ingredients: ['Dark chocolate', 'Flour', 'Butter', 'Eggs', 'Vanilla ice cream'],
      allergens: ['Dairy', 'Gluten', 'Eggs'],
      nutritionalInfo: { calories: 380, protein: 6, carbs: 45, fat: 18, fiber: 2 },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice, no pulp',
      price: 4.99,
      category: this.mockCategories[3],
      isAvailable: true,
      preparationTime: 3,
      ingredients: ['Fresh oranges'],
      allergens: [],
      nutritionalInfo: { calories: 110, protein: 2, carbs: 26, fat: 0, fiber: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      name: 'Greek Salad',
      description: 'Tomatoes, cucumber, olives, red onion, and feta cheese with olive oil dressing',
      price: 14.99,
      category: this.mockCategories[4],
      isAvailable: true,
      preparationTime: 8,
      ingredients: ['Tomatoes', 'Cucumber', 'Olives', 'Red onion', 'Feta cheese', 'Olive oil'],
      allergens: ['Dairy'],
      nutritionalInfo: { calories: 180, protein: 6, carbs: 12, fat: 14, fiber: 5 },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {
    // Initialize with mock data
    this.categoriesSubject.next(this.mockCategories);
    this.menuItemsSubject.next(this.mockMenuItems);
  }

  // Menu Items Methods
  getMenuItems(): Observable<MenuItem[]> {
    this.isLoadingSubject.next(true);
    return of(this.mockMenuItems).pipe(
      delay(800),
      tap(() => this.isLoadingSubject.next(false))
    );
  }

  getMenuItemById(id: string): Observable<MenuItem> {
    const item = this.mockMenuItems.find(item => item.id === id);
    if (!item) {
      return throwError(() => new Error('Menu item not found'));
    }
    return of(item).pipe(delay(300));
  }

  createMenuItem(itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Observable<MenuItem> {
    this.isLoadingSubject.next(true);
    
    return of(null).pipe(
      delay(1000),
      map(() => {
        const newItem: MenuItem = {
          ...itemData,
          id: (this.mockMenuItems.length + 1).toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.mockMenuItems.unshift(newItem);
        this.menuItemsSubject.next([...this.mockMenuItems]);
        this.isLoadingSubject.next(false);
        
        return newItem;
      })
    );
  }

  updateMenuItem(id: string, itemData: Partial<MenuItem>): Observable<MenuItem> {
    this.isLoadingSubject.next(true);
    
    return of(null).pipe(
      delay(1000),
      map(() => {
        const index = this.mockMenuItems.findIndex(item => item.id === id);
        if (index === -1) {
          throw new Error('Menu item not found');
        }
        
        const updatedItem: MenuItem = {
          ...this.mockMenuItems[index],
          ...itemData,
          updatedAt: new Date()
        };
        
        this.mockMenuItems[index] = updatedItem;
        this.menuItemsSubject.next([...this.mockMenuItems]);
        this.isLoadingSubject.next(false);
        
        return updatedItem;
      })
    );
  }

  deleteMenuItem(id: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    
    return of(null).pipe(
      delay(800),
      map(() => {
        const index = this.mockMenuItems.findIndex(item => item.id === id);
        if (index === -1) {
          throw new Error('Menu item not found');
        }
        
        this.mockMenuItems.splice(index, 1);
        this.menuItemsSubject.next([...this.mockMenuItems]);
        this.isLoadingSubject.next(false);
        
        return true;
      })
    );
  }

  // Categories Methods
  getCategories(): Observable<MenuCategory[]> {
    return of(this.mockCategories).pipe(delay(300));
  }

  createCategory(categoryData: Omit<MenuCategory, 'id'>): Observable<MenuCategory> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const newCategory: MenuCategory = {
          ...categoryData,
          id: (this.mockCategories.length + 1).toString()
        };
        
        this.mockCategories.push(newCategory);
        this.categoriesSubject.next([...this.mockCategories]);
        
        return newCategory;
      })
    );
  }

  // Utility Methods
  getMenuItemsByCategory(categoryId: string): Observable<MenuItem[]> {
    return this.menuItems$.pipe(
      map(items => items.filter(item => item.category.id === categoryId))
    );
  }

  searchMenuItems(query: string): Observable<MenuItem[]> {
    return this.menuItems$.pipe(
      map(items => items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(query.toLowerCase())
        )
      ))
    );
  }

  toggleAvailability(id: string): Observable<MenuItem> {
    const item = this.mockMenuItems.find(item => item.id === id);
    if (!item) {
      return throwError(() => new Error('Menu item not found'));
    }
    
    return this.updateMenuItem(id, { isAvailable: !item.isAvailable });
  }
}