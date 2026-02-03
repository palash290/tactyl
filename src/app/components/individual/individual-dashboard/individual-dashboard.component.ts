import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonService } from '../../../services/common.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-individual-dashboard',
  imports: [NgApexchartsModule, RouterLink, CommonModule],
  templateUrl: './individual-dashboard.component.html',
  styleUrl: './individual-dashboard.component.css'
})
export class IndividualDashboardComponent {

  chartOptions1: any;
  dashboardData: any;
  userType: any;
  taskList: any;
  hasChartData = false;


  constructor(private service: CommonService) { }

  ngOnInit() {
    this.userType = localStorage.getItem('userType');
    this.getDashboard();
    this.getDetails();
  }

  getDashboard() {
    this.service.get(this.userType == 'individual' ? `user/individualUserDashboard` : 'user/invitedTeamMemberDashboard').subscribe({
      next: (resp: any) => {
        this.dashboardData = resp.data[0];

        const total = this.dashboardData.total_tasks || 0;
        const completed = this.dashboardData.completed_tasks || 0;
        const pending = this.dashboardData.pending_tasks || 0;

        this.hasChartData = total > 0 || completed > 0 || pending > 0;

        this.chartOptions1 = {
          chart: {
            type: 'donut',
            height: 300,
            toolbar: { show: false }
          },
          series: [total, completed, pending],
          labels: ['Total Tasks', 'Completed', 'Pending'],
          colors: ['#4db8ff', '#3d6f4a', '#a5e3df'],
          plotOptions: {
            pie: {
              donut: {
                size: '70%',
                labels: {
                  show: true,
                  name: { show: true },
                  value: { show: true },
                  total: {
                    show: true,
                    label: 'Tasks',
                    formatter: () => total.toString()
                  }
                }
              }
            }
          },
          legend: {
            position: 'bottom',
            fontSize: '14px',
            markers: {
              width: 10,
              height: 10,
              radius: 50
            }
          },
          dataLabels: { enabled: false }
        };
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  getDetails() {
    this.service.get(`user/fetchTasksForCompass?user_type=${this.userType}`).subscribe({
      next: (resp: any) => {
        this.taskList = (resp.data || []).reverse().slice(0, 5);
      },
      error: (err) => {
        console.log(err)
      }
    });
  }


}
