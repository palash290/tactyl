import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-permissions',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent {

  data: any[] = [];
  checkAllView: boolean = false;

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.data = [
      { id: 1, title: 'View all tasks', checkedView: false },
      { id: 2, title: 'Create tasks', checkedView: false },
      { id: 3, title: 'Edit tasks', checkedView: false },
      { id: 4, title: 'Delete tasks', checkedView: false },
      { id: 5, title: 'Task Mark as complete', checkedView: false },
      { id: 6, title: 'Create Boards', checkedView: false }
    ];
  }

  /** Select / Deselect all rows */
  toggleAllCheckboxes(): void {
    this.data.forEach(item => {
      item.checkedView = this.checkAllView;
    });
  }

  /** Update Select All checkbox when row checkbox changes */
  updateColumnCheckAll(): void {
    this.checkAllView = this.data.every(item => item.checkedView);
  }

  /** Log selected permissions */
  logSelectedModules(): void {
    const selected = this.data
      .filter(item => item.checkedView)
      .map(item => item.title);

    console.log('Selected View Permissions:', selected);
  }

  backClicked(): void {
    this.location.back();
  }

}
