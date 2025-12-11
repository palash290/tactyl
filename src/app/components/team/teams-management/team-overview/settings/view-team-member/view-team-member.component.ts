import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CommonService } from '../../../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-view-team-member',
  imports: [],
  templateUrl: './view-team-member.component.html',
  styleUrl: './view-team-member.component.css'
})
export class ViewTeamMemberComponent {

  allMembers: any;
  memberId: any;

  constructor(private location: Location, private service: CommonService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.memberId = this.route.snapshot.queryParamMap.get('memberId');
    this.getUsers();
  }

  getUsers() {
    this.service.get(`user/fetchMembersDetailsByThereIds?member_id=${this.memberId}`).subscribe({
      next: (resp: any) => {
        this.allMembers = resp.data;
        // this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  backClicked() {
    this.location.back();
  }

  
}
