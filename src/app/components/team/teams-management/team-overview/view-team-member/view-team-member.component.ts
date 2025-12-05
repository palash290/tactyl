import { Component } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-view-team-member',
  imports: [],
  templateUrl: './view-team-member.component.html',
  styleUrl: './view-team-member.component.css'
})
export class ViewTeamMemberComponent {
  constructor(private location: Location) { }

  backClicked() {
    this.location.back();
  }
}
