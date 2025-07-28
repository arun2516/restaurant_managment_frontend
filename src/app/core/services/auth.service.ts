import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  // Mock users for development
  private mockUsers: User[] = [
    {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@restaurant.com',
      phone: '+1234567890',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      firstName: 'Manager',
      lastName: 'Smith',
      email: 'manager@restaurant.com',
      phone: '+1234567891',
      role: UserRole.MANAGER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      firstName: 'John',
      lastName: 'Waiter',
      email: 'waiter@restaurant.com',
      phone: '+1234567892',
      role: UserRole.WAITER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {
    // Check if user is already logged in
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('current_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: LoginCredentials): Observable<{ user: User; token: string }> {
    this.isLoadingSubject.next(true);

    // Simulate API call
    return of(null).pipe(
      delay(1500), // Simulate network delay
      map(() => {
        const user = this.mockUsers.find(u => u.email === credentials.email);
        
        if (!user) {
          throw new Error('User not found');
        }

        // In real app, password would be verified on backend
        if (credentials.password !== 'password123') {
          throw new Error('Invalid password');
        }

        const token = this.generateToken();
        return { user, token };
      }),
      tap(result => {
        // Store auth data
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('current_user', JSON.stringify(result.user));
        
        // Update state
        this.currentUserSubject.next(result.user);
        this.isLoadingSubject.next(false);
      }),
      map(result => {
        this.isLoadingSubject.next(false);
        return result;
      })
    );
  }

  register(userData: RegisterData): Observable<{ user: User; token: string }> {
    this.isLoadingSubject.next(true);

    return of(null).pipe(
      delay(1500),
      map(() => {
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Create new user
        const newUser: User = {
          id: (this.mockUsers.length + 1).toString(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Add to mock users
        this.mockUsers.push(newUser);

        const token = this.generateToken();
        return { user: newUser, token };
      }),
      tap(result => {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('current_user', JSON.stringify(result.user));
        this.currentUserSubject.next(result.user);
        this.isLoadingSubject.next(false);
      }),
      map(result => {
        this.isLoadingSubject.next(false);
        return result;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private generateToken(): string {
    return 'mock_token_' + Math.random().toString(36).substr(2, 9);
  }
}