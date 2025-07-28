import { Component, Input, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { User, UserRole } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
   @Input() isCollapsed = false;
  @Input() currentUser: User | null = null;

  currentRoute = '';

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.CASHIER]
    },
    {
      label: 'Orders',
      icon: 'receipt',
      route: '/orders',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.CASHIER]
    },
    {
      label: 'Menu Management',
      icon: 'restaurant-menu',
      route: '/menu',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF]
    },
    {
      label: 'Tables',
      icon: 'table-restaurant',
      route: '/tables',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER]
    },
    {
      label: 'Reservations',
      icon: 'event',
      route: '/reservations',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER]
    },
    {
      label: 'Staff',
      icon: 'people',
      route: '/staff',
      roles: [UserRole.ADMIN, UserRole.MANAGER]
    },
    {
      label: 'Inventory',
      icon: 'inventory',
      route: '/inventory',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF]
    },
    {
      label: 'Reports',
      icon: 'analytics',
      route: '/reports',
      roles: [UserRole.ADMIN, UserRole.MANAGER]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe((event) => {
      this.currentRoute = event.url;
    });
  }

  canAccessMenuItem(item: MenuItem): boolean {
    if (!this.currentUser) return false;
    return item.roles.includes(this.currentUser.role);
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'dashboard': '📊',
      'receipt': '🧾', 
      'restaurant-menu': '🍽️',
      'table-restaurant': '🪑',
      'event': '📅',
      'people': '👥',
      'inventory': '📦',
      'analytics': '📈'
    };
    
    return icons[iconName] || '📄';
  }

}
