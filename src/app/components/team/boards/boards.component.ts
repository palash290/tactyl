import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-boards',
  imports: [RouterLink],
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.css'
})
export class BoardsComponent {

  userType: any;

  ngOnInit(){
    this.userType = localStorage.getItem('userType');
  }


}
