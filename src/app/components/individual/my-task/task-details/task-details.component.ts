import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-task-details',
  imports: [RouterLink],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css'
})
export class TaskDetailsComponent {

  constructor(private location: Location) { }

  backClicked() {
    this.location.back();
  }

}
