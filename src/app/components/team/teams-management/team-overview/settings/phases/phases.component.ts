import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-phases',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './phases.component.html',
  styleUrl: './phases.component.css'
})
export class PhasesComponent {

  Form!: FormGroup;
  teamList: any;

  constructor(private service: CommonService, private toastr: NzMessageService) { }

  ngOnInit() {
    this.initForm();
    //this.getPhaes();
  }

  initForm() {
    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      boardId: new FormControl('', Validators.required),
      description: new FormControl(''),
    });
  }

  getPhaes() {
    this.service.get('user/fetchTeamsByTeamAdminId').subscribe({
      next: (resp: any) => {
        this.teamList = resp.data;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }


}
