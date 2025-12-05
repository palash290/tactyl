import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  @ViewChild('closeModal') closeModal!: ElementRef;


  Form!: FormGroup;
  loading: boolean = false;

  constructor(
    private apiSrevice: CommonService,
    private toastr: NzMessageService
  ) { }

  ngOnInit(): void {
    this.initForm()
  }

  initForm() {
    this.Form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    })
  }

  onSubmit() {
    this.Form.markAllAsTouched()
    if (this.Form.valid) {
      this.loading = true
      const formURlData = new URLSearchParams()
      formURlData.set('email', this.Form.value.email)
      this.apiSrevice
        .postAPI('user/forgot-password', formURlData.toString())
        .subscribe({
          next: (resp: any) => {
            if (resp.success == true) {
              this.loading = false;
              this.toastr.success(resp.message);
              this.Form.reset();
              this.closeModal.nativeElement.click();
            } else {
              this.loading = false;
              this.toastr.warning(resp.message);
            }
            // console.log(resp)
          },
          error: (error: any) => {
            this.loading = false;
            if (error.error.message) {
              this.toastr.error(error.error.message);
            } else {
              this.toastr.error('Something went wrong!');
            }
          }
        })
    }
  }


}
