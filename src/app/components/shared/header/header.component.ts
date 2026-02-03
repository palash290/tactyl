import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { CommonModule } from '@angular/common';
import { FcmService } from '../../../services/fcm.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  userData: any;
  notifications: any;

  constructor(private router: Router, private apiService: CommonService, private notificationService: FcmService) { }

  @ViewChild('closeModal') closeModal!: ElementRef;


  userType: any;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.userType = localStorage.getItem('userType');

    this.apiService.refreshSidebar$.subscribe(() => {
      this.getProfile();
    });

    this.notificationService.message$.subscribe((msg: any) => {
      // if (msg) {
        this.getNotifications();
      // }
    });
  }

  logout() {
    this.router.navigateByUrl('/');
    this.closeModal.nativeElement.click();
    // localStorage.clear();
  }

  getProfile() {
    this.apiService.get('user/getUserProfile').subscribe({
      next: (resp: any) => {
        this.userData = resp.data;
        localStorage.setItem('teamEmail', resp.data.email);
        localStorage.setItem('userId', resp.data.id);
        localStorage.setItem('profile_image', resp.data.profile_image);
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  unread_count: any;

  getNotifications() {
    this.apiService.get('user/getMyNotifications').subscribe({
      next: (resp: any) => {
        this.notifications = resp.data.notifications;
        this.unread_count = resp.data.unread_count;
      },
      error: (error) => {
        this.notifications = [];
        console.log(error.message);
      }
    });
  }

  markNotificationAsRead() {
    this.apiService.get('user/markNotificationAsRead').subscribe({
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


}
