import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, finalize, switchMap } from 'rxjs/operators';
import { MenuService } from '../../../core/services/menu.service';
import { MenuItem, MenuCategory } from '../../../core/models/menu-item.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-menu-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-menu-item.component.html',
  styleUrl: './edit-menu-item.component.scss'
})
export class EditMenuItemComponent {
   editItemForm: FormGroup;
  categories: MenuCategory[] = [];
  currentItem: MenuItem | null = null;
  isLoading = false;
  isSaving = false;
  itemId: string = '';
  
  private destroy$ = new Subject<void>();

  allergenOptions = [
    'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 
    'Peanuts', 'Wheat', 'Gluten', 'Soy', 'Sesame'
  ];

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editItemForm = this.createForm();
  }

  ngOnInit(): void {
    this.itemId = this.route.snapshot.params['id'];
    this.loadData();
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
      ingredients: this.fb.array([]),
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

  private loadData(): void {
    this.isLoading = true;
    
    combineLatest([
      this.menuService.getMenuItemById(this.itemId),
      this.menuService.getCategories()
    ])
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: ([item, categories]) => {
        this.currentItem = item;
        this.categories = categories.filter(cat => cat.isActive);
        this.populateForm(item);
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.router.navigate(['/menu']);
      }
    });
  }

  private populateForm(item: MenuItem): void {
    // Clear existing form arrays
    this.ingredientsArray.clear();
    this.allergensArray.clear();

    // Populate basic fields
    this.editItemForm.patchValue({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.category.id,
      preparationTime: item.preparationTime,
      isAvailable: item.isAvailable,
      nutritionalInfo: {
        calories: item.nutritionalInfo?.calories || '',
        protein: item.nutritionalInfo?.protein || '',
        carbs: item.nutritionalInfo?.carbs || '',
        fat: item.nutritionalInfo?.fat || '',
        fiber: item.nutritionalInfo?.fiber || ''
      }
    });

    // Populate ingredients
    item.ingredients.forEach(ingredient => {
      this.ingredientsArray.push(this.fb.group({
        name: [ingredient, [Validators.required, Validators.minLength(2)]]
      }));
    });

    // Add at least one ingredient field if none exist
    if (this.ingredientsArray.length === 0) {
      this.addIngredient();
    }

    // Populate allergens
    item.allergens.forEach(allergen => {
      this.allergensArray.push(this.fb.control(allergen));
    });
  }

  private createIngredientControl(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  get ingredientsArray(): FormArray {
    return this.editItemForm.get('ingredients') as FormArray;
  }

  get allergensArray(): FormArray {
    return this.editItemForm.get('allergens') as FormArray;
  }

  addIngredient(): void {
    this.ingredientsArray.push(this.createIngredientControl());
  }

  removeIngredient(index: number): void {
    if (this.ingredientsArray.length > 1) {
      this.ingredientsArray.removeAt(index);
    }
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
    if (this.editItemForm.valid && this.currentItem) {
      this.isSaving = true;
      const formValue = this.editItemForm.value;
      
      // Find selected category
      const selectedCategory = this.categories.find(cat => cat.id === formValue.categoryId);
      if (!selectedCategory) {
        console.error('Selected category not found');
        return;
      }

      // Prepare updated menu item data
      const updateData = {
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

      this.menuService.updateMenuItem(this.itemId, updateData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: (updatedItem) => {
            this.router.navigate(['/menu']);
          },
          error: (error) => {
            console.error('Error updating menu item:', error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private hasNutritionalInfo(): boolean {
    const nutritionalInfo = this.editItemForm.get('nutritionalInfo')?.value;
    return nutritionalInfo && Object.values(nutritionalInfo).some(value => value !== '');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editItemForm.controls).forEach(field => {
      const control = this.editItemForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.editItemForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must not exceed ${field.errors['max'].max}`;
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/menu']);
  }
}
