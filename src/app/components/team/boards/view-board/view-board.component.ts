import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-board',
  imports: [],
  templateUrl: './view-board.component.html',
  styleUrl: './view-board.component.css'
})
export class ViewBoardComponent {

  constructor(private location: Location) { }

  backClicked() {
    this.location.back();
  }

}
