import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-team-dashboard',
  imports: [NgApexchartsModule, RouterLink],
  templateUrl: './team-dashboard.component.html',
  styleUrl: './team-dashboard.component.css'
})
export class TeamDashboardComponent {


  chartOptions1: any;
  chartOptions2: any;
  dashboardData: any;

  constructor(private service: CommonService, private router: Router) { }

  ngOnInit() {
    this.getDashboard();
    this.chartOptions1 = {
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false }
      },

      series: [
        {
          name: 'Performance',
          data: [10, 25, 15, 40, 35, 50, 45]
        }
      ],

      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
      },

      stroke: {
        width: 3,
        curve: 'smooth'
      },

      markers: {
        size: 4
      },

      colors: ['#4f46e5'],
      title: { align: 'left' }
    };
  }

  getDashboard() {
    this.service.get(`user/dashboard`).subscribe({
      next: (resp: any) => {
        this.dashboardData = resp.data;

        const total = this.dashboardData.total_tasks || 0;
        const completed = this.dashboardData.completed_tasks || 0;
        const pending = this.dashboardData.pending_tasks || 0;

        this.chartOptions2 = {
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


}
