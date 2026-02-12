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

  constructor(private service: CommonService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.userType = localStorage.getItem('userType');
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.getTeamDashboard();
  }

  getTeamDashboard() {
    this.service.get(`user/teams/${this.teamId}/dashboard`).subscribe({
      next: (resp: any) => {
        this.dashboardData = resp.data;
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


}
