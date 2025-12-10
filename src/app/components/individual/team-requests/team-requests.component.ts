import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-team-requests',
  imports: [CommonModule],
  templateUrl: './team-requests.component.html',
  styleUrl: './team-requests.component.css'
})
export class TeamRequestsComponent {

  allRequests: any;
  id: any;
  loading: boolean = false;
  @ViewChild('closeModalAccept') closeModalAccept!: ElementRef;
  @ViewChild('closeModalReject') closeModalReject!: ElementRef;

  constructor(private service: CommonService, private router: Router, private toastr: NzMessageService) { }

  ngOnInit() {
    this.getAllRequests();
  }

  getAllRequests() {
    this.service.get('user/fetchAllRequestedTeams').subscribe({
      next: (resp: any) => {
        this.allRequests = resp.data;
        // this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }


  getId(id: any) {
    this.id = id;
  }

  accept() {
    this.loading = true;
    const formURlData = new URLSearchParams();
    formURlData.set('team_id', this.id);
    formURlData.set('isAccepted', '1');
    this.service.post(`user/acceptAndRejectInvitation`, formURlData.toString()).subscribe({
      next: (resp: any) => {
        this.closeModalAccept.nativeElement.click();
        this.toastr.success(resp.message);
        this.getAllRequests();
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        console.log(error.message);
      }
    });
  }

  reject() {
    this.loading = true;
    const formURlData = new URLSearchParams();
    formURlData.set('team_id', this.id);
    formURlData.set('isAccepted', '2');
    this.service.post(`user/acceptAndRejectInvitation`, formURlData.toString()).subscribe({
      next: (resp: any) => {
        this.closeModalReject.nativeElement.click();
        this.toastr.success(resp.message);
        this.getAllRequests();
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        console.log(error.message);
      }
    });
  }


}
