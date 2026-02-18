import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  userData: any;
  notifications: any;
  unread_count: any;

  constructor(private router: Router, private apiService: CommonService) { }

  @ViewChild('closeModal') closeModal!: ElementRef;


  userType: any;

  ngOnInit() {
    this.apiService.refreshSidebar$.subscribe(() => {
      this.getProfile();
    });
    this.userType = localStorage.getItem('userType');
    this.getNotifications();
  }

  logout() {
    this.router.navigateByUrl('/');
    this.closeModal.nativeElement.click();
    localStorage.clear();
  }

  getProfile() {
    this.apiService.get('user/profile').subscribe({
      next: (resp: any) => {
        this.userData = resp.data;
        localStorage.setItem('teamEmail', resp.data.email);
        localStorage.setItem('userId', resp.data.user_id);
        localStorage.setItem('is_free_trial_expired', resp.data.is_free_trial_expired);
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  getNotifications() {
    this.apiService.get('user/notifications').subscribe({
      next: (resp: any) => {
        this.notifications = resp.data.notifications;
        this.unread_count = resp.data?.unread_count;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  markNotificationAsRead() {
    this.apiService.patch('user/notifications/read', '').subscribe({
      next: (resp: any) => {
        // this.notifications = resp.data;
        this.getNotifications();
      },
      error: (error) => {
        this.notifications = [];
        console.log(error.message);
      }
    });
  }

  getTimeAgo(dateString: string): string {
    const createdDate = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - createdDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 30) {
      return 'just now';
    }

    if (diffMinutes < 1) {
      return `${diffSeconds}s`;
    }

    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }

    if (diffHours < 24) {
      return `${diffHours}h`;
    }

    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  }


}
