import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-my-performance',
  imports: [RouterLink, NgApexchartsModule],
  templateUrl: './my-performance.component.html',
  styleUrl: './my-performance.component.css'
})
export class MyPerformanceComponent {


  chartOptions1: any;

  ngOnInit() {
    this.chartOptions1 = {
      chart: {
        type: 'bar',
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


}
