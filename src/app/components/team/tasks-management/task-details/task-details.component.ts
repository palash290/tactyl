import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-task-details',
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css'
})
export class TaskDetailsComponent {

  Form!: FormGroup;
  notesForm!: FormGroup;
  taskId: any;
  teamId: any;
  taskDetails: any;
  noteList: any;
  loading: boolean = false;
  minDate: any;
  teamMembersList: any;
  phaseList: any;
  boardId: any;
  userType: any;
  @ViewChild('closeModalAdd') closeModalAdd!: ElementRef;
  @ViewChild('closeModalAddNotes') closeModalAddNotes!: ElementRef;
  @ViewChild('closeModalDelete') closeModalDelete!: ElementRef;

  constructor(private location: Location, private service: CommonService, private route: ActivatedRoute, private toastr: NzMessageService) { }

  ngOnInit() {
    this.taskId = this.route.snapshot.queryParamMap.get('taskId');
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.boardId = this.route.snapshot.queryParamMap.get('boardId');
    this.userType = localStorage.getItem('userType');
    this.getTaskDetails();
    this.getAllMembers();
    this.getNotes();
    this.initForm();
    this.getPhaes();
  }

  initForm() {
    const numberOnlyValidator = [
      Validators.required,
      Validators.pattern(/^\d+$/) // allows 0, 00, 01, 10
    ];

    this.notesForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });

    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      // selectedTeamId: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      isPrivate: new FormControl(false),
      isGoalRevelant: new FormControl(false),
      memberId: new FormControl('', Validators.required),
      phaseId: new FormControl('', Validators.required),
      estimatedHours: new FormControl('', numberOnlyValidator),
      estimatedMinutes: new FormControl('', numberOnlyValidator),
      is_urgent: new FormControl(false),
    },
      {
        validators: this.dateRangeValidator as any   // <-- FIX
      }
    );
  }

  getAllMembers() {
    this.service
      .get(`user/fetchTeamMembersByTeamId?teamId=${this.teamId}`)
      .subscribe({
        next: (resp: any) => {
          // keep only team members
          this.teamMembersList = (resp.data || []).filter(
            (member: any) => member.is_team_member === 1
          );
        },
        error: (error) => {
          console.log(error.message);
        },
      });
  }

  getPhaes() {
    this.service.get(`user/fetchPhasesByThereBoardId?team_id=${this.teamId}&board_id=${this.boardId}`).subscribe({
      next: (resp: any) => {
        this.phaseList = resp.data;
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
      formURlData.append('team_id', this.teamId);
      formURlData.append('user_id', this.Form.value.memberId);
      formURlData.append('phase_id', this.Form.value.phaseId);
      formURlData.append('start_date', this.Form.value.startDate);
      formURlData.append('due_date', this.Form.value.endDate);
      formURlData.append('priority', this.Form.value.priority);
      formURlData.append('is_private', '0');
      formURlData.append('estimated_hours', this.Form.value.estimatedHours);
      formURlData.append('estimated_minutes', this.Form.value.estimatedMinutes);
      formURlData.append('is_urgent', this.Form.value.is_urgent ? '1' : '0');
      formURlData.append('goal_relavent', this.Form.value.isGoalRevelant ? '1' : '0');

      this.service.post(`user/editTaskById?id=${this.taskId}`, formURlData.toString()).subscribe({
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

  getTaskDetails() {
    this.service.get(`user/fetchTaskByThereId?id=${this.taskId}`).subscribe({
      next: (resp: any) => {
        this.taskDetails = resp.data;
        this.Form.patchValue({
          title: resp.data.title,
          description: resp.data.description || '',
          phaseId: resp.data.phase_id,
          priority: resp.data.priority,
          startDate: resp.data.start_date,
          endDate: resp.data.due_date,
          memberId: resp.data.user_id,
          isGoalRevelant: resp.data.goal_relevant,
          is_urgent: resp.data.is_urgent,
          estimatedMinutes: resp.data.estimated_minutes,
          estimatedHours: resp.data.estimated_hours,
        });
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  getNotes() {
    this.service.get(`user/fetchNotesByTaskId?task_id=${this.taskId}`).subscribe({
      next: (resp: any) => {
        this.noteList = resp.data;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  onSubmitNotes() {
    this.notesForm.markAllAsTouched();

    const title = this.notesForm.value.title?.trim();

    if (!title) {
      return;
    }

    if (this.notesForm.valid) {
      this.loading = true;
      const formURlData: any = new URLSearchParams();
      formURlData.append('title', title);
      formURlData.append('description', this.notesForm.value.description);
      formURlData.append('task_id', this.taskId);

      this.service.post('user/createNotes', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.closeModalAddNotes.nativeElement.click();
            this.getNotes();
            // this.boardId = null;
            // this.service.triggerRefresh();
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
            this.getNotes();
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

  deleteTask() {
    this.loading = true;
    this.service.get(`user/deleteTaskByThereId?id=${this.taskId}`).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.backClicked();
        this.closeModalDelete.nativeElement.click();
        this.toastr.success(resp.message);
      },
      error: error => {
        this.loading = false;
        console.log(error.message);
      }
    });
  }

  backClicked() {
    this.location.back();
  }


}
