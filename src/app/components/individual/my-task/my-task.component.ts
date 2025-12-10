import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-my-task',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './my-task.component.html',
  styleUrl: './my-task.component.css'
})
export class MyTaskComponent {

  Form!: FormGroup;
  loading: boolean = false;
  minDate: any;

  constructor(private service: CommonService, private toastr: NzMessageService) { }

  ngOnInit() {
    this.initForm();
    this.dateValidation();
  }

  initForm() {
    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      assignedTo: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      phase: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      isPrivate: new FormControl('', Validators.required),
    });
  }

  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
    const day = today.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    this.minDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }


  onSubmit() {
    this.Form.markAllAsTouched();

    const title = this.Form.value.title?.trim();
    const description = this.Form.value.description?.trim();
    const assignedTo = this.Form.value.assignedTo?.trim();
    const priority = this.Form.value.priority?.trim();
    const phase = this.Form.value.assignedTo?.trim();
    const startDate = this.Form.value.priority?.trim();
    const endDate = this.Form.value.priority?.trim();

    if (!title || !description || !assignedTo || !priority || !phase || !startDate || !endDate) {
      return;
    }

    if (this.Form.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.append('title', this.Form.value.title);
      formURlData.append('description', this.Form.value.description);
      formURlData.append('assignedTo', this.Form.value.assignedTo);
      formURlData.append('priority', this.Form.value.priority);
      formURlData.append('phase', this.Form.value.phase);
      formURlData.append('startDate', this.Form.value.startDate);
      formURlData.append('endDate', this.Form.value.endDate);

      this.service.post('user/editProfile', formURlData).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.service.triggerRefresh();
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
