import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-tasks-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tasks-management.component.html',
  styleUrl: './tasks-management.component.css'
})
export class TasksManagementComponent {

  Form!: FormGroup;
  teamList: any;

  constructor(private service: CommonService, private toastr: NzMessageService) { }

  ngOnInit() {
    this.initForm();
    this.getTeams();
  }

  initForm() {
    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      selectedTeamId: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      isPrivate: new FormControl('', Validators.required),
      memberId: new FormControl('', Validators.required)
    });
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

  membersList: any[] = [];

  onTeamChange(event: any) {
    const selectedTeamId = event.target.value;

    if (selectedTeamId) {
      this.getMembers(selectedTeamId);

      // Optional: reset selected member when team changes
      this.Form.get('memberId')?.setValue('');
    } else {
      this.membersList = [];
    }
  }

  getMembers(selectedTeamId: any) {
    this.service.get(`user/fetchTeamMembersByTeamId?teamId=${selectedTeamId}`).subscribe({
      next: (resp: any) => {
        this.membersList = resp.data;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }



}
