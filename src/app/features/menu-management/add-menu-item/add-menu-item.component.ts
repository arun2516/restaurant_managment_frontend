import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MenuService } from '../../../core/services/menu.service';
import { MenuCategory } from '../../../core/models/menu-item.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-menu-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-menu-item.component.html',
  styleUrl: './add-menu-item.component.scss'
})
export class AddMenuItemComponent implements OnInit, OnDestroy {
    addItemForm: FormGroup;
  categories: MenuCategory[] = [];
  isLoading = false;
  isSaving = false;
  
  private destroy$ = new Subject<void>();

  allergenOptions = [
    'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 
    'Peanuts', 'Wheat', 'Gluten', 'Soy', 'Sesame'
  ];

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private router: Router
  ) {
    this.addItemForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(0.01), Validators.max(999.99)]],
      categoryId: ['', [Validators.required]],
      preparationTime: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      isAvailable: [true],
      ingredients: this.fb.array([this.createIngredientControl()]),
      allergens: this.fb.array([]),
      nutritionalInfo: this.fb.group({
        calories: ['', [Validators.min(0), Validators.max(9999)]],
        protein: ['', [Validators.min(0), Validators.max(999)]],
        carbs: ['', [Validators.min(0), Validators.max(999)]],
        fat: ['', [Validators.min(0), Validators.max(999)]],
        fiber: ['', [Validators.min(0), Validators.max(999)]]
      })
    });
  }

  private createIngredientControl(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.menuService.getCategories()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories.filter(cat => cat.isActive);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  get ingredientsArray(): FormArray {
    return this.addItemForm.get('ingredients') as FormArray;
  }

  get allergensArray(): FormArray {
    return this.addItemForm.get('allergens') as FormArray;
  }

  addIngredient(): void {
    this.ingredientsArray.push(this.createIngredientControl());
  }

  removeIngredient(index: number): void {
    if (this.ingredientsArray.length > 1) {
      this.ingredientsArray.removeAt(index);
    }
  }

  onAllergenToggle(allergen: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onAllergenChange(allergen, target.checked);
  }

  onAllergenChange(allergen: string, checked: boolean): void {
    const allergensArray = this.allergensArray;
    
    if (checked) {
      allergensArray.push(this.fb.control(allergen));
    } else {
      const index = allergensArray.controls.findIndex(
        control => control.value === allergen
      );
      if (index !== -1) {
        allergensArray.removeAt(index);
      }
    }
  }

  isAllergenSelected(allergen: string): boolean {
    return this.allergensArray.value.includes(allergen);
  }

  onSubmit(): void {
    if (this.addItemForm.valid) {
      this.isSaving = true;
      const formValue = this.addItemForm.value;
      
      // Find selected category
      const selectedCategory = this.categories.find(cat => cat.id === formValue.categoryId);
      if (!selectedCategory) {
        console.error('Selected category not found');
        return;
      }

      // Prepare menu item data
      const menuItemData = {
        name: formValue.name,
        description: formValue.description,
        price: parseFloat(formValue.price),
        category: selectedCategory,
        preparationTime: parseInt(formValue.preparationTime),
        isAvailable: formValue.isAvailable,
        ingredients: formValue.ingredients.map((ing: any) => ing.name).filter((name: string) => name.trim()),
        allergens: formValue.allergens || [],
        nutritionalInfo: this.hasNutritionalInfo() ? {
          calories: parseInt(formValue.nutritionalInfo.calories) || 0,
          protein: parseFloat(formValue.nutritionalInfo.protein) || 0,
          carbs: parseFloat(formValue.nutritionalInfo.carbs) || 0,
          fat: parseFloat(formValue.nutritionalInfo.fat) || 0,
          fiber: parseFloat(formValue.nutritionalInfo.fiber) || 0
        } : undefined
      };

      this.menuService.createMenuItem(menuItemData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: (newItem) => {
            this.router.navigate(['/menu']);
          },
          error: (error) => {
            console.error('Error creating menu item:', error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private hasNutritionalInfo(): boolean {
    const nutritionalInfo = this.addItemForm.get('nutritionalInfo')?.value;
    return nutritionalInfo && Object.values(nutritionalInfo).some(value => value !== '');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.addItemForm.controls).forEach(field => {
      const control = this.addItemForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.addItemForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must not exceed ${field.errors['max'].max}`;
    }
    return ''; // Always return empty string instead of undefined
  }

  cancel(): void {
    this.router.navigate(['/menu']);
  }
}
