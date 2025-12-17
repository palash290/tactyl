import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-permissions',
  imports: [],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent {

  constructor(private location: Location) { }


  backClicked() {
    this.location.back();
  }
  
}
