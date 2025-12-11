import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationErrorService } from '../../../services/validation-error.service';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuillModule } from 'ngx-quill';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonService } from '../../../services/common.service';
@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {

  Form: FormGroup;
  loading: boolean = false;
  isPasswordVisible: boolean = false;

  constructor(private service: CommonService, private router: Router, private fb: FormBuilder, public validationErrorService: ValidationErrorService, private toastr: NzMessageService, private route: ActivatedRoute) {
    this.Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  type: string = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.type = params['type'] || '';
      console.log("Selected Type =", this.type);
    });
  }

  login() {
    if (!this.type) {
      console.warn("Type missing, redirecting to default...");
      return;
    }

    this.Form.markAllAsTouched();

    if (this.Form.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('email', this.Form.value.email);
      formURlData.set('password', this.Form.value.password);
      if (this.type == 'individual') {
        formURlData.set('role', '1');
        formURlData.set('isIndividualLogin', '1');
      }
      if (this.type == 'invited') {
        formURlData.set('role', '1');
        formURlData.set('isIndividualLogin', '2');
      }
      if (this.type == 'team') {
        formURlData.set('role', '2');
      }
      this.service.post('user/signIn', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.service.setToken(resp.data);
            
            this.loading = false;

            if (this.type == 'team') {
              this.router.navigate(['/team/dashboard']);
              this.toastr.success(resp.message);
            } else if (this.type === 'individual') {
              this.router.navigate(['/individual/dashboard']);
              this.toastr.success(resp.message);
            } else if (this.type == 'invited') {
              this.router.navigate(['/set-password'], {
                queryParams: { oldPassword: this.Form.value.password, email: this.Form.value.email }
              });
            }
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;

          const msg =
            error.error?.message ||
            error.error?.error ||
            error.message ||
            "Something went wrong!";

          this.toastr.error(msg);
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }


}
