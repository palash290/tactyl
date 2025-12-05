import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  userData: any;

  constructor(private router: Router, private apiService: CommonService) { }

  @ViewChild('closeModal') closeModal!: ElementRef;


  userType: any;

  ngOnInit() {
    this.apiService.refreshSidebar$.subscribe(() => {
      this.getProfile();
    });
    this.userType = localStorage.getItem('userType');
  }

  logout() {
    this.router.navigateByUrl('/');
    this.closeModal.nativeElement.click();
    localStorage.clear();
  }

  getProfile() {
    this.apiService.get('user/getUserProfile').subscribe({
      next: (resp: any) => {
        this.userData = resp.data;
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }


}
