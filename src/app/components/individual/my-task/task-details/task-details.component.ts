import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonService } from '../../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-task-details',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css'
})
export class TaskDetailsComponent {

  taskId: any;
  Form!: FormGroup;
  loading: boolean = false;
  userId: any;
  phaseList: any;
  minDate: any;
  taskDetails: any;
  @ViewChild('closeModalAdd') closeModalAdd!: ElementRef;
  @ViewChild('closeModalDelete') closeModalDelete!: ElementRef;

  constructor(private service: CommonService, private location: Location, private route: ActivatedRoute, private toastr: NzMessageService, private router: Router) { }

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    this.taskId = this.route.snapshot.queryParamMap.get('taskId');
    this.initForm();
    this.dateValidation();
    this.getPhaes();
    this.getTaskDetails();
  }

  getTaskDetails() {
    this.service.get(`user/fetchIndividualTaskByThereId?id=${this.taskId}`).subscribe({
      next: (resp: any) => {
        this.taskDetails = resp.data;
        this.Form.patchValue({
          title: resp.data.title,
          description: resp.data.description || '',
          phaseId: resp.data.phase_id,
          priority: resp.data.priority,
          startDate: resp.data.start_date,
          endDate: resp.data.due_date,
          //isPrivate: item.is_private,
          isGoalRevelant: resp.data.goal_relevant,
        });
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  initForm() {
    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      // selectedTeamId: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      isPrivate: new FormControl(false),
      isGoalRevelant: new FormControl(false),
      // memberId: new FormControl('', Validators.required),
      phaseId: new FormControl('', Validators.required),
    },
      {
        validators: this.dateRangeValidator as any   // <-- FIX
      }
    );
  }

  backClicked() {
    this.location.back();
  }

  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
    const day = today.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    this.minDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }

  dateRangeValidator(group: FormGroup) {
    const from = group.get('startDate')?.value;
    const to = group.get('endDate')?.value;

    if (from && to && to < from) {
      return { dateInvalid: true };
    }

    return null;
  }

  deleteTask() {
    this.service.get(`user/deleteTaskByThereId?id=${this.taskId}`).subscribe({
      next: (resp: any) => {
        this.closeModalDelete.nativeElement.click();
        this.toastr.success(resp.message);
        this.router.navigateByUrl('/individual/my-task');
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  // fetchPhaseDetails(item: any) {
  //   this.taskId = item.id;
  //   this.Form.patchValue({
  //     title: item.title,
  //     description: item.description || '',
  //     selectedTeamId: item.team_id,
  //     memberId: item.user_id,
  //     phaseId: item.phase_id,
  //     priority: item.priority,
  //     startDate: item.start_date,
  //     endDate: item.due_date,
  //     isPrivate: item.is_private,
  //     isGoalRevelant: item.goal_relevant,
  //   });
  // }

  getPhaes() {
    this.service.get(`user/fetchIndividualUserPhasesByUserId`).subscribe({
      next: (resp: any) => {
        this.phaseList = resp.data;
        // this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  onSubmit() {
    this.Form.markAllAsTouched();

    const title = this.Form.value.title?.trim();

    if (!title) {
      return;
    }

    if (this.Form.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.append('title', title);
      formURlData.append('description', this.Form.value.description);
      formURlData.append('team_id', '0');
      formURlData.append('user_id', this.userId);
      formURlData.append('phase_id', this.Form.value.phaseId);
      formURlData.append('start_date', this.Form.value.startDate);
      formURlData.append('due_date', this.Form.value.endDate);
      formURlData.append('priority', this.Form.value.priority);
      // formURlData.append('is_private', this.Form.value.isPrivate ? '1' : '0');
      formURlData.append('is_private', '0');
      formURlData.append('goal_relavent', this.Form.value.isGoalRevelant ? '1' : '0');

      this.service.post(this.taskId ? `user/editTaskById?id=${this.taskId}` : 'user/createTask', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.closeModalAdd.nativeElement.click();
            this.taskId = null;
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.toastr.warning('Something went wrong.');
          console.log(error.message);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.toastr.warning('Please check all the fields!');
    }
  }

}
