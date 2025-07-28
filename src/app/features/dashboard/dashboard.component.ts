import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval, combineLatest } from 'rxjs';
import { takeUntil, startWith } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalTables: number;
  totalStaff: number;
  ordersToday: number;
  revenueToday: number;
  averageOrderValue: number;
  tableOccupancy: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  table: string;
  items: number;
  total: number;
  status: string;
  time: Date;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
    Math = Math;
   currentUser: User | null = null;
  stats: DashboardStats = {
    totalOrders: 0,
    totalRevenue: 0,
    totalTables: 0,
    totalStaff: 0,
    ordersToday: 0,
    revenueToday: 0,
    averageOrderValue: 0,
    tableOccupancy: 0
  };

  recentOrders: RecentOrder[] = [];
  isLoading = true;
  currentTime = new Date();

  private destroy$ = new Subject<void>();

  quickActions: QuickAction[] = [
    {
      title: 'New Order',
      description: 'Create a new order',
      icon: '📝',
      route: '/orders/create',
      color: 'primary',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER, UserRole.CASHIER]
    },
    {
      title: 'Add Menu Item',
      description: 'Add new menu item',
      icon: '🍽️',
      route: '/menu/add',
      color: 'success',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF]
    },
    {
      title: 'Manage Tables',
      description: 'View table status',
      icon: '🪑',
      route: '/tables',
      color: 'info',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER]
    },
    {
      title: 'Add Staff',
      description: 'Add new staff member',
      icon: '👥',
      route: '/staff/add',
      color: 'warning',
      roles: [UserRole.ADMIN, UserRole.MANAGER]
    },
    {
      title: 'View Reports',
      description: 'Check analytics',
      icon: '📊',
      route: '/reports',
      color: 'secondary',
      roles: [UserRole.ADMIN, UserRole.MANAGER]
    },
    {
      title: 'Inventory',
      description: 'Manage stock',
      icon: '📦',
      route: '/inventory',
      color: 'primary',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF]
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.loadDashboardData();
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    // Simulate API call with realistic restaurant data
    setTimeout(() => {
      this.stats = {
        totalOrders: 1247,
        totalRevenue: 45672.50,
        totalTables: 25,
        totalStaff: 18,
        ordersToday: 87,
        revenueToday: 3456.75,
        averageOrderValue: 39.73,
        tableOccupancy: 72
      };

      this.recentOrders = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          table: 'Table 5',
          items: 3,
          total: 45.50,
          status: 'preparing',
          time: new Date(Date.now() - 300000) // 5 min ago
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          table: 'Table 12',
          items: 2,
          total: 28.75,
          status: 'ready',
          time: new Date(Date.now() - 600000) // 10 min ago
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          table: 'Table 3',
          items: 5,
          total: 78.25,
          status: 'served',
          time: new Date(Date.now() - 900000) // 15 min ago
        },
        {
          id: '4',
          orderNumber: 'ORD-004',
          table: 'Table 8',
          items: 1,
          total: 12.50,
          status: 'pending',
          time: new Date(Date.now() - 120000) // 2 min ago
        }
      ];

      this.isLoading = false;
    }, 1000);
  }

  private startRealTimeUpdates(): void {
    // Update current time every second
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
      });

    // Simulate real-time stats updates every 30 seconds
    interval(30000)
      .pipe(
        takeUntil(this.destroy$),
        startWith(0)
      )
      .subscribe(() => {
        this.updateRealTimeStats();
      });
  }

  private updateRealTimeStats(): void {
    if (!this.isLoading) {
      // Simulate small changes in stats
      this.stats.ordersToday += Math.floor(Math.random() * 3);
      this.stats.revenueToday += Math.random() * 50;
      this.stats.tableOccupancy = Math.max(20, Math.min(95, this.stats.tableOccupancy + (Math.random() - 0.5) * 10));
    }
  }

  canAccessAction(action: QuickAction): boolean {
    if (!this.currentUser) return false;
    return action.roles.includes(this.currentUser.role);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'preparing': 'info',
      'ready': 'success',
      'served': 'secondary',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  }

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  }
}
