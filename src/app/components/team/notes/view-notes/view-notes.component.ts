import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-notes',
  imports: [],
  templateUrl: './view-notes.component.html',
  styleUrl: './view-notes.component.css'
})
export class ViewNotesComponent {

  constructor(private location: Location) { }

  backClicked() {
    this.location.back();
  }
}
