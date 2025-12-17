import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-tasks-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './tasks-management.component.html',
  styleUrl: './tasks-management.component.css'
})
export class TasksManagementComponent {

  Form!: FormGroup;
  teamList: any;
  teamMembers: any;
  membersList: any[] = [];
  loading: boolean = false;
  taskId: any
  phaseList: any;
  minDate: any;
  taskList: any;
  p: any = 1;
  selectedPriority: string = '';
  selectedRecent: string = 'DESC';
  selectedTeamId: string = '';
  searchText: string = '';
  showPrivateTask: boolean = false;
  @ViewChild('closeModalDelete') closeModalDelete!: ElementRef;
  @ViewChild('closeModalAdd') closeModalAdd!: ElementRef;

  constructor(private service: CommonService, private toastr: NzMessageService) { }

  ngOnInit() {
    this.initForm();
    this.getTeams();
    this.getAllTasks()
    this.dateValidation();
  }

  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  getAllTasks() {
    let params = new URLSearchParams();

    if (this.selectedPriority) {
      params.append('priority', this.selectedPriority);
    }

    if (this.selectedRecent) {
      params.append('recent', this.selectedRecent);
    }

    if (this.searchText?.trim()) {
      params.append('search', this.searchText.trim());
    }

    if (this.selectedTeamId) {
      params.append('team_id', this.selectedTeamId);
    }

    params.append('is_private', this.showPrivateTask ? '1' : '0');

    this.service.get(`user/fetchTotalTask?${params.toString()}`).subscribe({
      next: (resp: any) => {
        this.taskList = resp.data;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  initForm() {
    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      selectedTeamId: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      isPrivate: new FormControl(false),
      isGoalRevelant: new FormControl(false),
      memberId: new FormControl('', Validators.required),
      phaseId: new FormControl('', Validators.required),
    },
      {
        validators: this.dateRangeValidator as any   // <-- FIX
      }
    );
  }

  fetchPhaseDetails(item: any) {
    this.taskId = item.id;
    this.onTeamChange('', item.team_id)
    this.Form.patchValue({
      title: item.title,
      description: item.description || '',
      selectedTeamId: item.team_id,
      memberId: item.user_id,
      phaseId: item.phase_id,
      priority: item.priority,
      startDate: item.start_date,
      endDate: item.due_date,
      isPrivate: item.is_private,
      isGoalRevelant: item.goal_relevant,
    });
  }

  reset() {
    this.taskId = '';
    this.Form.patchValue({
      title: '',
      description: '',
      selectedTeamId: '',
      memberId: '',
      phaseId: '',
      priority: '',
      startDate: '',
      endDate: '',
      isPrivate: '',
      isGoalRevelant: '',
    });
  }

  dateRangeValidator(group: FormGroup) {
    const from = group.get('startDate')?.value;
    const to = group.get('endDate')?.value;

    if (from && to && to < from) {
      return { dateInvalid: true };
    }

    return null;
  }

  getTeams() {
    this.service.get('user/fetchTeamsByTeamAdminId').subscribe({
      next: (resp: any) => {
        this.teamList = resp.data
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  onTeamChange(event: any, itamId?: any) {
    if (!itamId) {
      const selectedTeamId = event.target.value;
      if (selectedTeamId) {
        this.getMembers(selectedTeamId);
        this.getPhaes(selectedTeamId)
        // Optional: reset selected member when team changes
        this.Form.get('memberId')?.setValue('');
      } else {
        this.membersList = [];
      }
    } else {
      const selectedTeamId = itamId;
      if (selectedTeamId) {
        this.getMembers(selectedTeamId);
        this.getPhaes(selectedTeamId)
        // Optional: reset selected member when team changes
        this.Form.get('memberId')?.setValue('');
      } else {
        this.membersList = [];
      }
    }
  }

  getMembers(selectedTeamId: any) {
    this.service.get(`user/fetchTeamsMembersByTeamIdForIndividual?teamId=${selectedTeamId}`).subscribe({
      next: (resp: any) => {
        this.membersList = resp.data;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  getPhaes(selectedTeamId: any) {
    this.service.get(`user/fetchPhaseByTeamId?team_id=${selectedTeamId}`).subscribe({
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
      formURlData.append('team_id', this.Form.value.selectedTeamId);
      formURlData.append('user_id', this.Form.value.memberId);
      formURlData.append('phase_id', this.Form.value.phaseId);
      formURlData.append('start_date', this.Form.value.startDate);
      formURlData.append('due_date', this.Form.value.endDate);
      formURlData.append('priority', this.Form.value.priority);
      formURlData.append('is_private', this.Form.value.isPrivate ? '1' : '0');
      formURlData.append('goal_relavent', this.Form.value.isGoalRevelant ? '1' : '0');

      this.service.post(this.taskId ? `user/editTaskById?id=${this.taskId}` : 'user/createTask', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.closeModalAdd.nativeElement.click();
            this.getAllTasks();
            this.taskId = null;
            this.Form.reset();
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
            this.getAllTasks();
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

  id: any;

  getId(id: any) {
    this.id = id;
  }

  deleteTask() {
    this.service.get(`user/deleteTaskByThereId?id=${this.id}`).subscribe({
      next: (resp: any) => {
        this.closeModalDelete.nativeElement.click();
        this.toastr.success(resp.message);
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  exportToCSV() {
    if (!this.taskList || this.taskList.length === 0) {
      return;
    }

    // CSV Header
    const headers = [
      'S.No',
      'Task Title',
      'Team',
      'Assignee',
      'Priority',
      'Phase',
      'Created At'
    ];

    const rows = this.taskList.map((item: any, index: number) => [
      index + 1,
      `"${item.title || ''}"`,
      `"${item.team_name || ''}"`,
      `"${item.name || ''}"`,
      item.priority || '',
      `"${item.phase_name || ''}"`,
      this.formatDate(item.created_at)
    ]);

    const csvContent =
      headers.join(',') + '\n' +
      rows.map((row: any) => row.join(',')).join('\n');

    this.downloadCSV(csvContent, 'task-list.csv');
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  downloadCSV(csv: string, fileName: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  }


}
