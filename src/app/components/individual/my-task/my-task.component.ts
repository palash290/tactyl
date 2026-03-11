import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../services/common.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-my-task',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule, NgxPaginationModule, RouterLink],
  templateUrl: './my-task.component.html',
  styleUrl: './my-task.component.css'
})
export class MyTaskComponent {

  Form!: FormGroup;
  loading: boolean = false;
  minDate: any;
  phaseList: any;
  boardTasks: any;
  taskList: any;
  taskId: any;
  userId: any;
  userType: any;
  taskVisibility: any = ' ';
  isRevelent: any = '';
  p: any = 1;
  current_plan: any;
  @ViewChild('closeModalAdd') closeModalAdd!: ElementRef;

  constructor(private service: CommonService, private toastr: NzMessageService, private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const storedPlan = localStorage.getItem('current_plan');

    this.current_plan = storedPlan ? JSON.parse(storedPlan) : null;
    this.userType = localStorage.getItem('userType');
    this.userId = localStorage.getItem('userId');
    this.taskVisibility = this.route.snapshot.queryParamMap.get('status') || ' ';
    this.initForm();
    this.dateValidation();
    this.getPhaes();
    this.getAllTasks();
  }

  initForm() {
    const numberOnlyValidator = [
      Validators.required,
      Validators.pattern(/^\d+$/),
    ];

    const minutesRangeValidator = [
      ...numberOnlyValidator,
      Validators.min(0),
      Validators.max(60),
    ];

    this.Form = new FormGroup({
      title: new FormControl('', Validators.required),
      // selectedTeamId: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      estimatedHours: new FormControl('', numberOnlyValidator),
      estimatedMinutes: new FormControl('', minutesRangeValidator),
      priority: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      isPrivate: new FormControl(false),
      isGoalRevelant: new FormControl(false),
      is_urgent: new FormControl(false),
      // memberId: new FormControl('', Validators.required),
      phaseId: new FormControl('', Validators.required),
    },
      {
        validators: this.dateRangeValidator as any   // <-- FIX
      }
    );
  }

  fetchPhaseDetails(item: any) {
    this.taskId = item.task_id;
    this.Form.patchValue({
      title: item.title,
      description: item.description || '',
      // selectedTeamId: item.team_id,
      memberId: item.assigned_to.user_id,
      phaseId: item.phase_id,
      priority: item.priority,
      startDate: this.toDateOnly(item.start_date),
      endDate: this.toDateOnly(item.due_date),
      isPrivate: item.is_private,
      isGoalRevelant: item.goal_relevant,
      estimatedMinutes: item.estimated_minutes,
      estimatedHours: item.estimated_hours,
      is_urgent: item.is_urgent,
    });
  }

  private toDateOnly(value: string): string {
    if (!value) return '';
    return value.split('T')[0]; // YYYY-MM-DD
  }

  getPriorityStyle(priority: string) {
    switch (priority) {
      case 'P1':
        return { backgroundColor: '#FEF2F2', color: '#EF4444' };
      case 'P2':
        return { backgroundColor: '#EFF6FF', color: '#3B82F6' };
      case 'P3':
        return { backgroundColor: '#FEFCE8', color: '#EAB308' };
      case 'P4':
        return { backgroundColor: '#F9FAFB', color: '#6B7280' };
      default:
        return {};
    }
  }

  dateRangeValidator(group: FormGroup) {
    const from = group.get('startDate')?.value;
    const to = group.get('endDate')?.value;

    if (from && to && to < from) {
      return { dateInvalid: true };
    }

    return null;
  }

  getPhaes() {
    this.service.get(`user/phases`).subscribe({
      next: (resp: any) => {
        this.phaseList = resp.data;
        // this.filterTable();
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  // getTasks() {
  //   this.service.get(`user/tasks`).subscribe({
  //     next: (resp: any) => {
  //       this.boardTasks = resp.data;
  //       this.filterList()
  //     },
  //     error: (error) => {
  //       console.log(error.message);
  //     }
  //   });
  // }

  getAllTasks() {
    let params = new URLSearchParams();

    // if (this.selectedPriority) {
    //   params.append('priority', this.selectedPriority);
    // }

    // if (this.selectedRecent) {
    //   params.append('order', this.selectedRecent);
    // }

    // if (this.searchText?.trim()) {
    //   params.append('search', this.searchText.trim());
    // }

    // if (this.selectedTeamId) {
    //   params.append('team_id', this.selectedTeamId);
    // }

    // params.append('is_private', this.showPrivateTask ? '1' : '0');
    // if (this.taskVisibility == 'private') {
    //   params.append('is_private', '1');
    // } else {
    //   params.append('is_private', '0');
    // }


    this.service.get(`user/tasks?${params.toString()}`).subscribe({
      next: (resp: any) => {
        this.taskList = resp.data;
        this.filterList();
      },
      error: (error) => {
        console.log(error.message);
        this.taskList = [];
      }
    });
  }

  searchText: string = '';
  filteredData: any[] = [];
  selectedPriority = '';
  sortOrder = 'desc';

filterList() {

  let tasks = [...this.taskList];

  // 🔍 Search filter
  if (this.searchText.trim()) {
    const keyword = this.searchText.toLowerCase();

    tasks = tasks.filter(task =>
      task.title?.toLowerCase().includes(keyword) ||
      task.description?.toLowerCase().includes(keyword)
    );
  }

  // 🎯 Priority filter
  if (this.selectedPriority) {
    tasks = tasks.filter(task =>
      task.priority === this.selectedPriority
    );
  }

  // ✅ Completed / Pending filter
  if (this.taskVisibility === 'show') {
    tasks = tasks.filter(task => task.status === 'Completed');
  }
  else if (this.taskVisibility === 'hide') {
    tasks = tasks.filter(task => task.status === 'Pending');
  }

  // ⭐ Relevant filter
  if (this.isRevelent === 'yes') {
    tasks = tasks.filter(task => task.goal_relevant == 1);
  }
  else if (this.isRevelent === 'no') {
    tasks = tasks.filter(task => task.goal_relevant == 0);
  }

  this.filteredData = tasks;

}


  dateValidation() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
    const day = today.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    this.minDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }


  onSubmit() {
    this.Form.markAllAsTouched();

    const title = this.Form.value.title?.trim();

    if (!title) {
      return;
    }

    if (this.Form.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.append('title', title);
      formURlData.append('description', this.Form.value.description);
      formURlData.append('assign_to', this.userId);
      formURlData.append('phase_id', this.Form.value.phaseId);
      formURlData.append('start_date', this.Form.value.startDate);
      formURlData.append('due_date', this.Form.value.endDate);
      formURlData.append('priority', this.Form.value.priority);
      formURlData.append('estimated_hours', this.Form.value.estimatedHours);
      formURlData.append('estimated_minutes', this.Form.value.estimatedMinutes);
      formURlData.append('is_private', this.Form.value.isPrivate ? '1' : '0');
      // formURlData.append('is_private', '0');
      formURlData.append('goal_relevant', this.Form.value.isGoalRevelant ? '1' : '0');
      formURlData.append('is_urgent', this.Form.value.is_urgent ? '1' : '0');

      this.service.post(this.taskId ? `user/tasks/${this.taskId}` : 'user/tasks', formURlData.toString()).subscribe({
        next: (resp: any) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            this.closeModalAdd.nativeElement.click();
            this.getAllTasks();
            this.taskId = null;
            this.reset();
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
            this.getAllTasks();
          }
        },
        error: (error) => {
          this.toastr.warning('Something went wrong.');
          console.log(error.message);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.toastr.warning('Please check all the fields!');
    }
  }

  reset() {
    this.taskId = '';
    this.Form.patchValue({
      title: '',
      description: '',
      estimated_minutes: '',
      estimated_hours: '',
      phaseId: '',
      priority: '',
      startDate: '',
      endDate: '',
      isPrivate: '',
      isGoalRevelant: '',
      is_urgent: ''
    });
  }

  id: any;

  getId(id: any) {
    this.id = id;
  }

  get connectedDropLists(): string[] {
    return this.boardTasks.map((p: any) => `phase-${p.id}`);
  }

  // drop(event: CdkDragDrop<any[]>, targetPhase: any) {

  //   // 1️⃣ Reorder inside same phase
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex
  //     );
  //     return;
  //   }

  //   const previousList = event.previousContainer.data;
  //   const currentList = event.container.data;

  //   const movedTask = previousList[event.previousIndex];

  //   transferArrayItem(
  //     previousList,
  //     currentList,
  //     event.previousIndex,
  //     event.currentIndex
  //   );

  //   movedTask.phase_id = targetPhase.id;

  //   this.updateTaskPhase(
  //     movedTask.id,
  //     targetPhase.id,
  //     previousList,
  //     currentList,
  //     event
  //   );
  // }

  // updateTaskPhase(
  //   taskId: number,
  //   phaseId: number,
  //   previousList: any[],
  //   currentList: any[],
  //   event: CdkDragDrop<any[]>
  // ) {
  //   const formURlData = new URLSearchParams();
  //   formURlData.append('task_id', String(taskId));
  //   formURlData.append('phase_id', String(phaseId));

  //   this.service.post('user/changePhasesTaskByDragAndDrop', formURlData.toString())
  //     .subscribe({
  //       next: (resp: any) => {
  //         if (!resp.success) {
  //           this.rollback(event, previousList, currentList);
  //           this.toastr.warning(resp.message);

  //         } else {
  //           //this.toastr.success(resp.message);
  //           this.getTasks();
  //         }
  //       },
  //       error: () => {
  //         this.rollback(event, previousList, currentList);
  //         this.toastr.error('Something went wrong');
  //       }
  //     });
  // }

  // rollback(
  //   event: CdkDragDrop<any[]>,
  //   previousList: any[],
  //   currentList: any[]
  // ) {
  //   transferArrayItem(
  //     currentList,
  //     previousList,
  //     event.currentIndex,
  //     event.previousIndex
  //   );
  //   //this.updateTaskCounts();
  // }


  openTask(task: any) {
    this.router.navigate(['/individual/task-details'], {
      queryParams: { taskId: task.id }
    });
  }


}
