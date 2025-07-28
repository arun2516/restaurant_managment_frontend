import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl, FormsModule } from '@angular/forms';
import { MenuService } from '../../../core/services/menu.service';
import { MenuItem, MenuCategory } from '../../../core/models/menu-item.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent implements OnInit, OnDestroy {
    menuItems: MenuItem[] = [];
  categories: MenuCategory[] = [];
  filteredItems: MenuItem[] = [];
  isLoading = false;
  
  searchControl = new FormControl('');
  selectedCategory = 'all';
  selectedStatus = 'all';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  private destroy$ = new Subject<void>();

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    combineLatest([
      this.menuService.getMenuItems(),
      this.menuService.getCategories(),
      this.menuService.isLoading$
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([items, categories, loading]) => {
        this.menuItems = items;
        this.categories = categories;
        this.isLoading = loading;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading menu data:', error);
      }
    });
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  applyFilters(): void {
    let filtered = [...this.menuItems];
    
    // Search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        )
      );
    }
    
    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category.id === this.selectedCategory);
    }
    
    // Status filter
    if (this.selectedStatus !== 'all') {
      const isAvailable = this.selectedStatus === 'available';
      filtered = filtered.filter(item => item.isAvailable === isAvailable);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = a.category.name.localeCompare(b.category.name);
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    this.filteredItems = filtered;
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSortChange(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  toggleAvailability(item: MenuItem): void {
    this.menuService.toggleAvailability(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedItem) => {
          // Item will be updated via the observable subscription
        },
        error: (error) => {
          console.error('Error toggling availability:', error);
        }
      });
  }

  deleteItem(item: MenuItem): void {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.menuService.deleteMenuItem(item.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Item will be removed via the observable subscription
          },
          error: (error) => {
            console.error('Error deleting item:', error);
          }
        });
    }
  }

  navigateToAdd(): void {
    this.router.navigate(['/menu/add']);
  }

  navigateToEdit(item: MenuItem): void {
    this.router.navigate(['/menu/edit', item.id]);
  }

  navigateToDetails(item: MenuItem): void {
    this.router.navigate(['/menu/details', item.id]);
  }

  canEdit(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF].includes(user.role) : false;
  }

  canDelete(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? [UserRole.ADMIN, UserRole.MANAGER].includes(user.role) : false;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  trackByItem(index: number, item: MenuItem): string {
    return item.id;
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.sortBy = 'name';
    this.sortDirection = 'asc';
    this.applyFilters();
  }
}
