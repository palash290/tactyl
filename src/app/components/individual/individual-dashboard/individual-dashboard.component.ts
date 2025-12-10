import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-individual-dashboard',
  imports: [RouterLink, NgApexchartsModule],
  templateUrl: './individual-dashboard.component.html',
  styleUrl: './individual-dashboard.component.css'
})
export class IndividualDashboardComponent {

  chartOptions1: any;

  ngOnInit() {
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

}
