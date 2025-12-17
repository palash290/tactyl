import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-task-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css'
})
export class TaskDetailsComponent {

  taskId: any;
  taskDetails: any;

  constructor(private location: Location, private service: CommonService, private route: ActivatedRoute, private toastr: NzMessageService) { }

  ngOnInit() {
    this.taskId = this.route.snapshot.queryParamMap.get('taskId');
    this.getTaskDetails();
  }

  getTaskDetails() {
    this.service.get(`user/fetchTaskByThereId?id=${this.taskId}`).subscribe({
      next: (resp: any) => {
        this.taskDetails = resp.data;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  backClicked() {
    this.location.back();
  }
}
