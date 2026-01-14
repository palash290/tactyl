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
  taskList: any;
  profile_image: any;

  constructor(private service: CommonService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.userType = localStorage.getItem('userType');
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.profile_image = localStorage.getItem('profile_image');
    this.getTeamDashboard();
    this.getDetails()
  }

  getDetails() {
    this.service
      .get(`user/fetchTasksForCompass?user_type=${this.userType}`)
      .subscribe({
        next: (resp: any) => {
          const teamId = Number(this.teamId);

          this.taskList = (resp.data || [])
            .filter((item: any) => Number(item.team_id) === teamId)
            .reverse()
            .slice(0, 5);
        },
        error: (err) => {
          console.log(err);
        }
      });
  }


  getTeamDashboard() {
    this.service.get(`user/teamOverviewByTeamId?team_id=${this.teamId}`).subscribe({
      next: (resp: any) => {
        this.dashboardData = resp.data;
        // this.getLogs();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  getLogs() {
    this.service.get(`user/fetchLogsByTeamId?team_id=${this.teamId}`).subscribe({
      next: (resp: any) => {
        this.activeLogs = resp.data;
      },
      error: (error) => {
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
