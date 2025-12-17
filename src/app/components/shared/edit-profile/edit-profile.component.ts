import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {

  profileForm!: FormGroup;
  userDet: any;
  userEmail: any;
  first_name: any;
  designation: any;
  loading: boolean = false;
  profileImg: string | ArrayBuffer | null = null;
  selectedFile!: File;

  constructor(private service: CommonService, private toastr: NzMessageService) { }

  ngOnInit() {
    this.initForm();
    this.loadUserProfile();
  }

  initForm() {
    this.profileForm = new FormGroup({
      name: new FormControl('', Validators.required),
      designation: new FormControl('', Validators.required),
      email: new FormControl({ value: this.userEmail, disabled: true })
    });
  }

  loadUserProfile() {
    this.service.get('user/getUserProfile').subscribe({
      next: (resp: any) => {
        this.userEmail = resp.data.email;
        this.first_name = resp.data.name;
        this.designation = resp.data.Designation;
        this.profileImg = resp.data.profile_image;
        this.profileForm.patchValue({
          name: this.first_name,
          designation: this.designation,
          email: this.userEmail
        });
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  onSubmit() {
    this.profileForm.markAllAsTouched();

    const first_name = this.profileForm.value.name?.trim();
    const designation = this.profileForm.value.designation?.trim();

    if (!first_name || !designation) {
      return;
    }

    if (this.profileForm.valid) {
      this.loading = true;
      const formURlData = new FormData();
      formURlData.append('name', this.profileForm.value.name);
      formURlData.append('Designation', this.profileForm.value.designation);

      if (this.selectedFile) {
        formURlData.append('profile_image', this.selectedFile);
      }

      this.service.post('user/editProfile', formURlData).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.service.triggerHeaderRefresh();
            this.loadUserProfile();
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
            this.loadUserProfile();
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

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];

      const reader = new FileReader();
      reader.onload = () => {

        this.profileImg = reader.result;

      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // backClicked() {
  //   this.location.back();
  // }


}
