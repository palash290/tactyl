import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-teams-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './teams-sidebar.component.html',
  styleUrl: './teams-sidebar.component.css'
})
export class TeamsSidebarComponent {

  constructor(private router: Router) { }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  @Output() toggleEvent = new EventEmitter<boolean>();

  toggleMenu() {
    this.toggleEvent.emit(false); // Emit event to parent component
  }


}
