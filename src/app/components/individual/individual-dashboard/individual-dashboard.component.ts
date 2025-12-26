import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-individual-dashboard',
  imports: [RouterLink, NgApexchartsModule],
  templateUrl: './individual-dashboard.component.html',
  styleUrl: './individual-dashboard.component.css'
})
export class IndividualDashboardComponent {

  chartOptions1: any;
  dashboardData: any;
  userType: any;

  constructor(private service: CommonService, private router: Router) { }

  ngOnInit() {
    this.userType = localStorage.getItem('userType');
    this.getDashboard();
    this.chartOptions1 = {
      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        }
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
      colors: ['#4f46e5'], // Indigo color
      title: {
        align: 'left'
      }
    };
  }

  getDashboard() {
    this.service.get(this.userType == 'individual' ? `user/individualUserDashboard` : 'user/invitedTeamMemberDashboard').subscribe({
      next: (resp: any) => {
        this.dashboardData = resp.data[0];
        // this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }


}
