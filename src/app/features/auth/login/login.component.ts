import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy  {
    loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  
  private destroy$ = new Subject<void>();

  // Demo credentials for easy testing
  demoCredentials = [
    { email: 'admin@restaurant.com', password: 'password123', role: 'Admin' },
    { email: 'manager@restaurant.com', password: 'password123', role: 'Manager' },
    { email: 'waiter@restaurant.com', password: 'password123', role: 'Waiter' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit(): void {
    // Subscribe to loading state
    this.authService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      const credentials = this.loginForm.value;

      this.authService.login(credentials)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (result) => {
            // Redirect to return URL or dashboard
            const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
            localStorage.removeItem('returnUrl');
            this.router.navigate([returnUrl]);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Login failed. Please try again.';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  fillDemoCredentials(demo: any): void {
    this.loginForm.patchValue({
      email: demo.email,
      password: demo.password
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(field => {
      const control = this.loginForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return ''; // Always return string
  }
}
