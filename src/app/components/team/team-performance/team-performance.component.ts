import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-team-performance',
  imports: [NgApexchartsModule],
  templateUrl: './team-performance.component.html',
  styleUrl: './team-performance.component.css'
})
export class TeamPerformanceComponent {

  chartOptions1: any;
  performanceData: any;
  performance_insights0: any;
  performance_insights1: any;
  performance_insights2: any;
  graph_data: any;

  constructor(private service: CommonService) { }

  ngOnInit() {
    this.getTeams();
  }

  getTeams() {
    this.service.get('user/teamPerformanceByTeamId').subscribe({
      next: (resp: any) => {
        this.performanceData = resp.data.team_performance;
        this.performance_insights0 = resp.data.performance_insights[0];
        this.performance_insights1 = resp.data.performance_insights[1];
        this.performance_insights2 = resp.data.performance_insights[2];
        this.graph_data = resp.data.graph_data;

        const teamNames = this.graph_data.map((t: any) => t.team_name);
        const completionRates = this.graph_data.map((t: any) => t.completion_rate);
        const remainingRates = this.graph_data.map(
          (t: any) => 100 - t.completion_rate
        );


        this.chartOptions1 = {
          chart: {
            type: 'bar',
            height: 320,
            stacked: true,
            toolbar: { show: false }
          },

          series: [
            {
              name: 'Completed',
              data: completionRates
            },
            {
              name: 'Remaining',
              data: remainingRates
            }
          ],

          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '45%',
              borderRadius: 10,
              borderRadiusApplication: 'end',
              borderRadiusWhenStacked: 'last',
              dataLabels: {
                position: 'center'
              }
            }
          },

          dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val}%`,
            style: {
              fontSize: '12px',
              fontWeight: '600'
            }
          },

          xaxis: {
            categories: teamNames
          },

          yaxis: {
            max: 100,
            labels: {
              formatter: (val: number) => `${val}%`
            }
          },

          colors: ['#6C63FF', '#ECEBFF'],

          legend: {
            show: false
          }
        };

      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }


}
