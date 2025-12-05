import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-team-overview',
  imports: [RouterLink],
  templateUrl: './team-overview.component.html',
  styleUrl: './team-overview.component.css'
})
export class TeamOverviewComponent {
  constructor(private location: Location) { }

  backClicked() {
    this.location.back();
  }
}
