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

    this.Form.markAllAsTouched();

    if (this.Form.invalid) return;

    this.loading = true;

    const formURlData = new URLSearchParams();
    formURlData.set('email', this.Form.value.email);
    formURlData.set('password', this.Form.value.password);

    this.service.post('public/login', formURlData.toString()).subscribe({

      next: (resp: any) => {

        this.loading = false;

        if (!resp.success) {
          this.toastr.warning(resp.message);
          return;
        }

        const user = resp.data?.user;
        const plan = user?.current_plan?.plan_name;

        this.service.setToken(resp.data.token);
        localStorage.setItem('free_trial', user?.free_trial || '');
        localStorage.setItem('user_id', user?.user_id);

        // 🔹 Free trial inactive
        if (user?.free_trial === 'Inactivated') {
          this.router.navigate(['/free-trial']);
          return;
        }

        // 🔹 No plan
        if (!user?.current_plan) {
          this.router.navigate(['/pricing-plan'], {
            queryParams: { user_id: user?.user_id }
          });
          return;
        }

        // 🔹 Plan routing
        if (plan === 'Free Trial' || plan === 'Gold') {
          this.router.navigateByUrl('/team/dashboard');
        }
        else if (plan === 'Bronze') {
          this.router.navigateByUrl('/individual/dashboard');
        }
        else {
          this.router.navigate(['/pricing-plan'], {
            queryParams: { user_id: user?.user_id }
          });
        }

      },

      error: (error) => {

        this.loading = false;

        const msg =
          error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          "Something went wrong!";

        this.toastr.error(msg);
      }

    });

  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }


}
