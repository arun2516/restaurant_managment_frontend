import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard} from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Auth routes (no layout)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  
  // Protected routes (with main layout)
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'menu',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF] },
        loadComponent: () => import('./features/menu-management/menu-list/menu-list.component').then(m => m.MenuListComponent)
      },
      {
        path: 'menu/add',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF] },
        loadComponent: () => import('./features/menu-management/add-menu-item/add-menu-item.component').then(m => m.AddMenuItemComponent)
      },
      {
        path: 'menu/edit/:id',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF] },
        loadComponent: () => import('./features/menu-management/edit-menu-item/edit-menu-item.component').then(m => m.EditMenuItemComponent)
      }
    ]
  },
  
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];