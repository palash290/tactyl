import { Component } from '@angular/core';
import { CommonService } from '../../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

  dashboardData: any;
  teamId: any;
  userType: any;
  activeLogs: any;
  userId: any;
  team_admin_id: any;

  constructor(private service: CommonService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.userId = localStorage.getItem('user_id');
    this.userType = localStorage.getItem('userType');
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.getTeamDashboard();
    this.getTeamPermissionsForUsers();
  }

  getTeamPermissionsForUsers() {
    this.service.get(`user/team/user-permissions?team_id=${this.teamId}&user_id=${this.userId}`).subscribe({
      next: (resp: any) => {

      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  getTeamDashboard() {
    this.service.get(`user/teams/${this.teamId}/dashboard`).subscribe({
      next: (resp: any) => {
        this.dashboardData = resp.data;
        this.team_admin_id = resp.data.team_admin_id;
        // this.getLogs();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  // getLogs() {
  //   this.service.get(`user/fetchLogsByTeamId?team_id=${this.teamId}`).subscribe({
  //     next: (resp: any) => {
  //       this.activeLogs = resp.data;
  //     },
  //     error: (error) => {
  //       console.log(error.message);
  //     }
  //   });
  // }

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
      return `${diffSeconds}s ago`;
    }

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }


}
