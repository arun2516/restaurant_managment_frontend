import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
    @Input() currentUser: User | null = null;
  @Input() currentTheme: 'light' | 'dark' = 'light';
  
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  showUserDropdown = false;

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onToggleTheme(): void {
    this.toggleTheme.emit();
  }

  onLogout(): void {
    this.logout.emit();
    this.showUserDropdown = false;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }
}
